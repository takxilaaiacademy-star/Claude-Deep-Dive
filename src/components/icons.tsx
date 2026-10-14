import type { ReactElement } from 'react';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import PowerOutlinedIcon from '@mui/icons-material/PowerOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import type { Module, Screen } from '../types';

const MODULE_ICONS: Record<number, ReactElement> = {
  1: <ExploreOutlinedIcon />,
  2: <PowerOutlinedIcon />,
  3: <SearchRoundedIcon />,
  4: <BadgeOutlinedIcon />,
  5: <FolderOpenOutlinedIcon />,
  6: <LayersOutlinedIcon />,
  7: <CodeRoundedIcon />,
  8: <GridViewRoundedIcon />,
  9: <PaletteOutlinedIcon />,
  10: <InsightsRoundedIcon />,
  11: <BusinessOutlinedIcon />,
  12: <RocketLaunchOutlinedIcon />,
  13: <EmojiEventsOutlinedIcon />,
};

export const moduleIcon = (n: number): ReactElement => MODULE_ICONS[n] ?? <LightbulbOutlinedIcon />;

/** Icon shown in the round badge on each screen (same mapping as the original course). */
export function screenIcon(s: Screen, m: Module): ReactElement {
  if (s.type === 'tool_intro' || s.type === 'prompt_and_output' || s.type === 'practice_task') return <CodeRoundedIcon />;
  if (s.type === 'key_takeaways') return <VerifiedUserOutlinedIcon />;
  if (s.type === 'module_complete') return <CheckRoundedIcon />;
  if (s.type === 'course_complete') return <EmojiEventsOutlinedIcon />;
  if (s.type === 'reorder') return <SwapVertRoundedIcon />;
  if (s.type === 'mcq' || s.type === 'multi_select' || s.type === 'multi_fill_blank') return <TrackChangesRoundedIcon />;
  return moduleIcon(m.number);
}
