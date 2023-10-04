import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LightDarkButton from '../../components/lightDarkButton';
import { darkTheme } from '../themes';

export default function LoginPage() {
  const [userJSON, setUserJSON] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState(darkTheme);
  const [currentMode, setCurrentMode] = useState('dark');
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <Head></Head>
      <CssBaseline />
      <LightDarkButton
        setTheme={setTheme}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
      />
      <Box sx={{ width: '100%', textAlign: 'center', marginTop: '10%' }}>
        <Paper
          elevation={3}
          sx={{
            maxWidth: 'fit-content',
            margin: '0 auto',
            padding: '2em',
            borderRadius: '20px',
          }}
        >
          <Typography variant="h4" sx={{ textAlign: 'left' }}>
            Sign in
          </Typography>
          <br />
          <TextField
            variant="outlined"
            size="large"
            label="username"
            autoComplete="off"
            fullWidth
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <br />
          <TextField
            variant="outlined"
            size="large"
            type="password"
            label="password"
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <bv />
          <br />
          <Button
            variant="contained"
            size="large"
            sx={{ marginRight: '1.1em' }}
            onClick={async () => {
              const response = await fetch('../api/find-userid', {
                method: 'POST',
                body: JSON.stringify({
                  username: username,
                  password: password,
                }),
              });
              const data = await response.json();
              if (data.userId == null) {
                setErrorOpen(true);
                setMessage('Invalid username or password');
                return;
              }
              router.push('/?user=' + data.userId + '&theme=' + currentMode);
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={async () => {
              const response = await fetch('../api/create-user', {
                method: 'POST',
                body: JSON.stringify({
                  username: username,
                  password: password,
                }),
              });
              const data = await response.json();
              if (data.userId == null) {
                setErrorOpen(true);
                setMessage('Username already exists');
                return;
              }
              router.push('/?user=' + data.userId + '&theme=' + currentMode);
            }}
          >
            Create Account
          </Button>
        </Paper>
      </Box>
      <Dialog open={errorOpen} onClose={() => setErrorOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
