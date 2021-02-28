import { ItemBank } from 'oldschooljs/dist/meta/types';
import {
	BaseEntity,
	Column,
	Entity,
	getConnection,
	Index,
	PrimaryColumn,
	PrimaryGeneratedColumn
} from 'typeorm';

import { client } from '../..';
import { Activity } from '../constants';
import { GroupMonsterActivityTaskOptions } from '../minions/types';
import { ActivityTaskOptions } from '../types/minions';
import { isGroupActivity } from '../util';
import { taskNameFromType } from '../util/taskNameFromType';

@Entity({ name: 'activity' })
export class ActivityTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@PrimaryColumn('varchar', { length: 19, name: 'user_id', nullable: false })
	public userID!: string;

	@Column('timestamp without time zone', { name: 'start_date', nullable: false })
	public startDate!: Date;

	@Column('timestamp without time zone', { name: 'finish_date', nullable: false })
	public finishDate!: Date;

	@Column('integer', { name: 'duration', nullable: false })
	public duration!: number;

	@Index()
	@Column('boolean', { name: 'completed', nullable: false })
	public completed: boolean = false;

	@Index()
	@Column('boolean', { name: 'group_activity', nullable: false })
	public groupActivity: boolean = false;

	@Column({ type: 'enum', enum: Activity, name: 'type', nullable: false })
	public type!: Activity;

	@PrimaryColumn('varchar', { length: 19, name: 'channel_id', nullable: false })
	public channelID!: string;

	@Column('json', { name: 'data', nullable: false })
	public data!: Omit<ActivityTaskOptions, 'finishDate' | 'id' | 'type' | 'channelID' | 'userID'>;

	@Column('json', { name: 'loot', nullable: true, default: null })
	public loot!: ItemBank | null;

	public get taskData() {
		return {
			...this.data,
			type: this.type,
			userID: this.userID,
			channelID: this.channelID,
			duration: this.duration,
			finishDate: this.finishDate,
			id: this.id
		};
	}

	public getUsers(): string[] {
		if (this.groupActivity) {
			return (this.data as GroupMonsterActivityTaskOptions).users;
		}
		return [this.userID];
	}

	public async complete() {
		if (this.completed) {
			throw new Error(`Tried to complete an already completed task.`);
		}

		const taskName = taskNameFromType(this.type);
		const task = client.tasks.get(taskName);

		if (!task) {
			throw new Error(`Missing task`);
		}

		try {
			client.oneCommandAtATimeCache.add(this.userID);
			await task.run(this.taskData);
		} catch (err) {
			console.error(err);
		} finally {
			client.oneCommandAtATimeCache.delete(this.userID);
			const users = isGroupActivity(this.data) ? this.data.users : [this.userID];
			for (const user of users) {
				client.minionActivityCache.delete(user);
			}
		}

		await getConnection()
			.createQueryBuilder()
			.update(ActivityTable)
			.set({ completed: true })
			.where('id = :id', { id: this.id })
			.execute();
	}
}
