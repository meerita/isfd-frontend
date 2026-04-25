/** @format */

'use client';

import { useState, useTransition } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'sonner';

import { updateUserSkills } from '@/_actions/user/updateUserSkills';
import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import Grid from '@/_components/layout/Grid';
import Icon from '@/_components/Icon';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import { ICON_NAME } from '@/_constants/icons';
import { USER_SKILL_LEVEL_OPTIONS } from '@/_constants/skills';
import type { Sport } from '@/_types/sport';
import type { User, UserSkill, UserSkillLevel } from '@/_types/user';

type SportOption = Readonly<{
  value: string;
  label: string;
}>;

const DEFAULT_SKILL_LEVEL: UserSkillLevel = 'ANY';
const AVAILABLE_ICON_NAMES = new Set(Object.values(ICON_NAME));

function buildSportOptions(
  sports: ReadonlyArray<Sport>,
): ReadonlyArray<SportOption> {
  return [...sports]
    .map(function mapSport(sport) {
      return {
        value: sport.id,
        label: sport.localizedName || sport.name,
      };
    })
    .sort(function sortSports(left, right) {
      return left.label.localeCompare(right.label);
    });
}

function normalizeUserSkills(user: User): UserSkill[] {
  return (user.profile?.skills ?? [])
    .filter(function filterSkill(skill): skill is UserSkill {
      return Boolean(skill?.sportId && skill?.level);
    })
    .map(function mapSkill(skill) {
      return {
        sportId: skill.sportId,
        level: skill.level,
      };
    });
}

function resolveSportLabel(sport?: Sport): string {
  if (!sport) {
    return 'Unknown sport';
  }

  return sport.localizedName || sport.name || sport.id;
}

function isKnownIcon(
  value?: string,
): value is (typeof ICON_NAME)[keyof typeof ICON_NAME] {
  if (!value) {
    return false;
  }

  return AVAILABLE_ICON_NAMES.has(value as (typeof ICON_NAME)[keyof typeof ICON_NAME]);
}

function getSportIconName(
  sport?: Sport,
): (typeof ICON_NAME)[keyof typeof ICON_NAME] {
  if (isKnownIcon(sport?.iconKey)) {
    return sport.iconKey;
  }

  if (isKnownIcon(sport?.icon)) {
    return sport.icon;
  }

  return ICON_NAME.sports;
}

export default function SkillsForm({
  user,
  sports,
}: Readonly<{
  user: User;
  sports: ReadonlyArray<Sport>;
}>) {
  const sportOptions = buildSportOptions(sports);
  const sportsMap = new Map(
    sports.map(function mapSport(sport) {
      return [sport.id, sport] as const;
    }),
  );
  const initialSportId = sportOptions[0]?.value ?? '';
  const [selectedSportId, setSelectedSportId] = useState(initialSportId);
  const [selectedLevel, setSelectedLevel] =
    useState<UserSkillLevel>(DEFAULT_SKILL_LEVEL);
  const [skills, setSkills] = useState<UserSkill[]>(normalizeUserSkills(user));
  const [isPending, startTransition] = useTransition();

  const username = user.identity?.username?.trim() ?? '';
  const uuid = (user.uuid ?? '').trim();

  async function persistSkills(
    nextSkills: ReadonlyArray<UserSkill>,
  ): Promise<void> {
    if (!uuid) {
      toast.error('Missing user identifier to update skills.');
      return;
    }

    try {
      const result = await updateUserSkills({
        uuid,
        username,
        skills: nextSkills,
      });

      if (result.status === 'error') {
        toast.error(result.error?.message ?? 'Failed to update skills.', {
          description: result.error?.reason,
        });
        return;
      }

      setSkills([...nextSkills]);
      toast.success('Skills updated successfully');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update skills.';

      toast.error(message, {
        description: 'Unexpected error while updating skills.',
      });
    }
  }

  function submitSkills(nextSkills: ReadonlyArray<UserSkill>): void {
    startTransition(function runSkillsUpdate() {
      void persistSkills(nextSkills);
    });
  }

  function handleAddSkill(): void {
    if (!selectedSportId) {
      toast.error('Select a sport before adding a skill.');
      return;
    }

    const duplicateSkill = skills.some(function hasSameSport(skill) {
      return skill.sportId === selectedSportId;
    });

    if (duplicateSkill) {
      toast.error('This user already has a skill for the selected sport.');
      return;
    }

    submitSkills([
      ...skills,
      {
        sportId: selectedSportId,
        level: selectedLevel,
      },
    ]);
  }

  function handleRemoveSkill(sportId: string): void {
    submitSkills(
      skills.filter(function filterSkill(skill) {
        return skill.sportId !== sportId;
      }),
    );
  }

  function handleSportChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedSportId(event.target.value);
  }

  function handleLevelChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedLevel(event.target.value as UserSkillLevel);
  }

  return (
    <Form>
      <Grid gap={24}>
        <Grid gap={8}>
          <Text size='small' color='gray' className='margin--0'>
            Add one skill level per sport. The complete skills list is sent on
            each update to keep the user profile synchronized with the API.
          </Text>
        </Grid>
        <Grid display='flex' gap={8} alignItems='end'>
          <Select
            label='Sport'
            name='profile.skills.sportId'
            value={selectedSportId}
            onChange={handleSportChange}
            placeholder='Select sport'
            disabled={isPending || sportOptions.length === 0}
            className='flex-grow--1'
          >
            {sportOptions.map(function renderSportOption(option) {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </Select>
          <Select
            label='Level'
            name='profile.skills.level'
            value={selectedLevel}
            onChange={handleLevelChange}
            disabled={isPending}
            className='flex-grow--1'
          >
            {USER_SKILL_LEVEL_OPTIONS.map(function renderLevelOption(option) {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </Select>
          <Button
            type='button'
            icon='plus'
            onClick={handleAddSkill}
            disabled={isPending || sportOptions.length === 0}
          >
            {isPending ? 'Saving...' : 'Add Skill'}
          </Button>
        </Grid>
        <Grid gap={16}>
          <Title size='small' weight='bold'>
            Current Skills
          </Title>
          {skills.length === 0 ? (
            <Text size='small' color='gray' className='margin--0'>
              This user has no skills yet.
            </Text>
          ) : (
            <ul className='list-style--none margin--0 padding--0'>
              {skills.map(function mapSkill(skill) {
                const sport = sportsMap.get(skill.sportId);

                return (
                  <li
                    key={skill.sportId}
                    className='display--flex align-items--center gap--12 border-bottom-width--1 border-bottom-style--solid border-bottom-color--almost-white padding-block--12'
                  >
                    <Icon
                      name={getSportIconName(sport)}
                      size={24}
                      fill='black'
                    />
                    <Grid className='flex-grow--1' gap={2}>
                      <Text weight='semibold' className='margin--0'>
                        {resolveSportLabel(sport)}
                      </Text>
                      <Text size='small' color='gray' className='margin--0'>
                        {USER_SKILL_LEVEL_OPTIONS.find(function findOption(option) {
                          return option.value === skill.level;
                        })?.label ?? skill.level}
                      </Text>
                    </Grid>
                    <button
                      type='button'
                      onClick={() => {
                        handleRemoveSkill(skill.sportId);
                      }}
                      aria-label={`Remove ${resolveSportLabel(sport)} skill`}
                      className='margin--0 padding--0 border-width--0 background-color--transparent cursor--pointer display--block'
                      disabled={isPending}
                    >
                      <Icon name='remove' size={24} className='display--block' />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Grid>
      </Grid>
    </Form>
  );
}
