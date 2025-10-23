import { pgTable, serial, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  position: text('position').notNull(),
  birthYear: integer('birth_year').notNull(),
  goals: integer('goals').notNull().default(0),
  presences: integer('presences').notNull().default(0),
  yellowCards: integer('yellow_cards').notNull().default(0),
  redCards: integer('red_cards').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow()
});

export const trainings = pgTable('trainings', {
  id: serial('id').primaryKey(),
  weekNumber: integer('week_number').notNull(),
  weekLabel: text('week_label').notNull(),
  sessions: jsonb('sessions').notNull(), // Array di {day, date, attendance: {playerId: boolean}}
  createdAt: timestamp('created_at').defaultNow()
});

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  round: integer('round').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  home: text('home').notNull(),
  away: text('away').notNull(),
  address: text('address').notNull().default(''),
  city: text('city').notNull().default(''),
  result: text('result'),
  events: jsonb('events'), // Array di eventi
  minutes: jsonb('minutes'), // Mappa {playerId: minuti}
  createdAt: timestamp('created_at').defaultNow()
});

export const callups = pgTable('callups', {
  id: serial('id').primaryKey(),
  opponent: text('opponent').notNull().default(''),
  date: text('date').notNull().default(''),
  meetingTime: text('meeting_time').notNull().default(''),
  kickoffTime: text('kickoff_time').notNull().default(''),
  location: text('location').notNull().default(''),
  isHome: boolean('is_home').notNull().default(true),
  selectedPlayers: jsonb('selected_players').$type<number[]>().notNull(), // Array di player IDs
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const formations = pgTable('formations', {
  id: serial('id').primaryKey(),
  module: text('module').notNull().default('4-3-3'),
  positions: jsonb('positions').notNull(), // Array di player assignments
  substitutes: jsonb('substitutes').notNull(), // Array di substitute IDs
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  selectedWeek: integer('selected_week').notNull().default(1),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;
export type Training = typeof trainings.$inferSelect;
export type InsertTraining = typeof trainings.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;
export type Callup = typeof callups.$inferSelect;
export type InsertCallup = typeof callups.$inferInsert;
export type Formation = typeof formations.$inferSelect;
export type InsertFormation = typeof formations.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = typeof appSettings.$inferInsert;
