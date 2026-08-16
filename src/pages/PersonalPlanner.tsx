import React from 'react';
import { TimeBlockPlanner } from '../components/planner/TimeBlockPlanner';

export const PersonalPlanner: React.FC = () => {
  return (
    <TimeBlockPlanner
      space="personal"
      title="Personal Planner"
      subtitle="Life-side routines, habits, and personal day time-blocks"
    />
  );
};

