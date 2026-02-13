
import React from 'react';
import { Chore } from './types';

export const INITIAL_CHORES: Chore[] = [
  { id: '1', title: 'Make Bed', points: 10, isRecurring: true },
  { id: '2', title: 'Empty Dishwasher', points: 20, isRecurring: true },
  { id: '3', title: 'Take out Trash', points: 15, isRecurring: true },
  { id: '4', title: 'Clean Room', points: 50, isRecurring: true },
  { id: '5', title: 'Homework Completed', points: 30, isRecurring: true },
  { id: '6', title: 'Pet Feeding', points: 10, isRecurring: true },
];

export const REWARDS = [
  { id: 'r1', title: '30 Mins Screen Time', cost: 100 },
  { id: 'r2', title: 'Select Dinner Menu', cost: 200 },
  { id: 'r3', title: 'New Toy/Book', cost: 500 },
  { id: 'r4', title: 'Late Bedtime (1hr)', cost: 300 },
];

export const AVATARS = [
  'https://picsum.photos/seed/child1/200',
  'https://picsum.photos/seed/child2/200',
  'https://picsum.photos/seed/child3/200',
  'https://picsum.photos/seed/child4/200',
];
