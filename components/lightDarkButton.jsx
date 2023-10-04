import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { lightTheme, darkTheme } from '../pages/themes.js';

export default function LightDarkButton({
  setTheme,
  currentMode,
  setCurrentMode,
}) {
  return (
    <IconButton
      sx={{ position: 'absolute', right: '10px', top: '10px' }}
      size="large"
      onClick={() => {
        if (currentMode === 'dark') {
          setTheme(lightTheme);
        } else {
          setTheme(darkTheme);
        }
        setCurrentMode(currentMode === 'dark' ? 'light' : 'dark');
      }}
    >
      {(() => {
        if (currentMode === 'dark') {
          return <LightModeIcon />;
        } else {
          return <DarkModeIcon />;
        }
      })()}
    </IconButton>
  );
}
