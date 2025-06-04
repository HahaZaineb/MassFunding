import { Project, vestingSchedule } from '../contracts/main';
import { Address, Context } from '@massalabs/massa-as-sdk';

// Helper functions at module level
function createTestProject(): Project {
  return new Project(
    1, // projectId
    new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // creator
    'Test Project', // title
    'Test Description', // description
    1000, // fundingGoal
    0, // amountRaised
    new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // beneficiary
    'Test Category', // category
    10, // lockPeriod
    5, // releaseInterval
    20, // releasePercentage
    'image.jpg', // image
    Context.currentPeriod(), // creationPeriod
    0, // vestingScheduleId
    false // initialVestingTriggered
  );
}

function createTestVestingSchedule(): vestingSchedule {
  return new vestingSchedule(
    1, // id
    new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // beneficiary
    1000, // totalAmount
    0, // amountClaimed
    10, // lockPeriod
    5, // releaseInterval
    20, // releasePercentage
    Context.currentPeriod() + 10 // nextReleasePeriod
  );
}

describe('Project Serialization', () => {
  it('should correctly serialize and deserialize a project', () => {
    const project = createTestProject();
    const serialized = project.serialize();
    const deserialized = new Project();
    deserialized.deserialize(serialized);

    expect(deserialized.projectId).toBe(project.projectId);
    expect(deserialized.creator.toString()).toBe(project.creator.toString());
    expect(deserialized.title).toBe(project.title);
    expect(deserialized.description).toBe(project.description);
    expect(deserialized.fundingGoal).toBe(project.fundingGoal);
    expect(deserialized.amountRaised).toBe(project.amountRaised);
    expect(deserialized.beneficiary.toString()).toBe(project.beneficiary.toString());
    expect(deserialized.category).toBe(project.category);
    expect(deserialized.lockPeriod).toBe(project.lockPeriod);
    expect(deserialized.releaseInterval).toBe(project.releaseInterval);
    expect(deserialized.releasePercentage).toBe(project.releasePercentage);
    expect(deserialized.image).toBe(project.image);
    expect(deserialized.creationPeriod).toBe(project.creationPeriod);
    expect(deserialized.vestingScheduleId).toBe(project.vestingScheduleId);
    expect(deserialized.initialVestingTriggered).toBe(project.initialVestingTriggered);
  });

  it('should handle large values correctly', () => {
    const largeProject = new Project(
      1, // projectId
      new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // creator
      'A'.repeat(1000), // Very long title
      'B'.repeat(10000), // Very long description
      1000, // fundingGoal
      1000, // amountRaised
      new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // beneficiary
      'Category',
      10, // lockPeriod
      5, // releaseInterval
      100, // releasePercentage
      'image.jpg',
      Context.currentPeriod(),
      1, // vestingScheduleId
      true // initialVestingTriggered
    );

    const serialized = largeProject.serialize();
    const deserialized = new Project();
    deserialized.deserialize(serialized);

    expect(deserialized.projectId).toBe(largeProject.projectId);
    expect(deserialized.title).toBe(largeProject.title);
    expect(deserialized.description).toBe(largeProject.description);
    expect(deserialized.fundingGoal).toBe(largeProject.fundingGoal);
    expect(deserialized.amountRaised).toBe(largeProject.amountRaised);
    expect(deserialized.lockPeriod).toBe(largeProject.lockPeriod);
    expect(deserialized.releaseInterval).toBe(largeProject.releaseInterval);
    expect(deserialized.vestingScheduleId).toBe(largeProject.vestingScheduleId);
  });
});

describe('VestingSchedule Serialization', () => {
  it('should correctly serialize and deserialize a vesting schedule', () => {
    const schedule = createTestVestingSchedule();
    const serialized = schedule.serialize();
    const deserialized = new vestingSchedule();
    deserialized.deserialize(serialized);

    expect(deserialized.id).toBe(schedule.id);
    expect(deserialized.beneficiary.toString()).toBe(schedule.beneficiary.toString());
    expect(deserialized.totalAmount).toBe(schedule.totalAmount);
    expect(deserialized.amountClaimed).toBe(schedule.amountClaimed);
    expect(deserialized.lockPeriod).toBe(schedule.lockPeriod);
    expect(deserialized.releaseInterval).toBe(schedule.releaseInterval);
    expect(deserialized.releasePercentage).toBe(schedule.releasePercentage);
    expect(deserialized.nextReleasePeriod).toBe(schedule.nextReleasePeriod);
  });

  it('should handle large values correctly', () => {
    const largeSchedule = new vestingSchedule(
      1, // id
      new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // beneficiary
      1000, // totalAmount
      1000, // amountClaimed
      10, // lockPeriod
      5, // releaseInterval
      100, // releasePercentage
      10 // nextReleasePeriod
    );

    const serialized = largeSchedule.serialize();
    const deserialized = new vestingSchedule();
    deserialized.deserialize(serialized);

    expect(deserialized.id).toBe(largeSchedule.id);
    expect(deserialized.totalAmount).toBe(largeSchedule.totalAmount);
    expect(deserialized.amountClaimed).toBe(largeSchedule.amountClaimed);
    expect(deserialized.lockPeriod).toBe(largeSchedule.lockPeriod);
    expect(deserialized.releaseInterval).toBe(largeSchedule.releaseInterval);
    expect(deserialized.nextReleasePeriod).toBe(largeSchedule.nextReleasePeriod);
  });
}); 