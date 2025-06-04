import { Project, vestingSchedule } from '../contracts/main';
import { Address, Context, Storage } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';

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

function getProjectKey(projectId: u64): StaticArray<u8> {
  return new Args().add('projects').add(projectId).serialize();
}

describe('Integration Tests', () => {
  it('should create a project and store it correctly', () => {
    const project = createTestProject();
    const projectKey = getProjectKey(project.projectId);
    Storage.set(projectKey, project.serialize());

    const storedData = Storage.get(projectKey);
    const deserialized = new Project();
    deserialized.deserialize(storedData);

    expect(deserialized.projectId).toBe(project.projectId);
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

  it('should update project amount raised correctly', () => {
    const project = createTestProject();
    const projectKey = getProjectKey(project.projectId);
    Storage.set(projectKey, project.serialize());

    // Simulate funding the project
    project.amountRaised += 500;
    Storage.set(projectKey, project.serialize());

    const storedData = Storage.get(projectKey);
    const deserialized = new Project();
    deserialized.deserialize(storedData);

    expect(deserialized.amountRaised).toBe(500);
  });

  it('should create a vesting schedule and store it correctly', () => {
    const schedule = new vestingSchedule(
      1, // id
      new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // beneficiary
      1000, // totalAmount
      0, // amountClaimed
      10, // lockPeriod
      5, // releaseInterval
      20, // releasePercentage
      Context.currentPeriod() + 10 // nextReleasePeriod
    );

    const scheduleKey = new Args().add('vestingSchedules::').add(schedule.id).serialize();
    Storage.set(scheduleKey, schedule.serialize());

    const storedData = Storage.get(scheduleKey);
    const deserialized = new vestingSchedule();
    deserialized.deserialize(storedData);

    expect(deserialized.id).toBe(schedule.id);
    expect(deserialized.beneficiary.toString()).toBe(schedule.beneficiary.toString());
    expect(deserialized.totalAmount).toBe(schedule.totalAmount);
    expect(deserialized.amountClaimed).toBe(schedule.amountClaimed);
    expect(deserialized.lockPeriod).toBe(schedule.lockPeriod);
    expect(deserialized.releaseInterval).toBe(schedule.releaseInterval);
    expect(deserialized.releasePercentage).toBe(schedule.releasePercentage);
    expect(deserialized.nextReleasePeriod).toBe(schedule.nextReleasePeriod);
  });

  it('should update vesting schedule amount claimed correctly', () => {
    const schedule = new vestingSchedule(
      1, // id
      new Address('AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCksDowqmGWxfym93M'), // beneficiary
      1000, // totalAmount
      0, // amountClaimed
      10, // lockPeriod
      5, // releaseInterval
      20, // releasePercentage
      Context.currentPeriod() + 10 // nextReleasePeriod
    );

    const scheduleKey = new Args().add('vestingSchedules::').add(schedule.id).serialize();
    Storage.set(scheduleKey, schedule.serialize());

    // Simulate claiming tokens
    schedule.amountClaimed += 200;
    Storage.set(scheduleKey, schedule.serialize());

    const storedData = Storage.get(scheduleKey);
    const deserialized = new vestingSchedule();
    deserialized.deserialize(storedData);

    expect(deserialized.amountClaimed).toBe(200);
  });

  it('should handle funding a project and updating vesting schedule', () => {
    const project = createTestProject();
    const projectKey = getProjectKey(project.projectId);
    Storage.set(projectKey, project.serialize());

    // Simulate funding the project
    project.amountRaised += 500;
    Storage.set(projectKey, project.serialize());

    // Create a vesting schedule for the project
    const schedule = new vestingSchedule(
      1, // id
      project.beneficiary, // beneficiary
      project.amountRaised, // totalAmount
      0, // amountClaimed
      project.lockPeriod, // lockPeriod
      project.releaseInterval, // releaseInterval
      project.releasePercentage, // releasePercentage
      Context.currentPeriod() + project.lockPeriod // nextReleasePeriod
    );

    const scheduleKey = new Args().add('vestingSchedules::').add(schedule.id).serialize();
    Storage.set(scheduleKey, schedule.serialize());

    // Verify project and vesting schedule are updated correctly
    const storedProjectData = Storage.get(projectKey);
    const deserializedProject = new Project();
    deserializedProject.deserialize(storedProjectData);
    expect(deserializedProject.amountRaised).toBe(500);

    const storedScheduleData = Storage.get(scheduleKey);
    const deserializedSchedule = new vestingSchedule();
    deserializedSchedule.deserialize(storedScheduleData);
    expect(deserializedSchedule.totalAmount).toBe(500);
  });

  it('should handle invalid project ID gracefully', () => {
    const invalidProjectId = 999;
    const projectKey = getProjectKey(invalidProjectId);
    expect(Storage.has(projectKey)).toBe(false);
  });

  it('should handle invalid vesting schedule ID gracefully', () => {
    const invalidScheduleId = 999;
    const scheduleKey = new Args().add('vestingSchedules::').add(invalidScheduleId).serialize();
    expect(Storage.has(scheduleKey)).toBe(false);
  });
}); 