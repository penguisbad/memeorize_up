import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { findUser } from '../fetchData';
import { darkTheme, lightTheme } from '../themes';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import BackButton from '../../components/backButton';
import LightDarkButton from '../../components/lightDarkButton';
import { useRouter } from 'next/router';

export async function getServerSideProps({ query }) {
  if (query.user == null) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
      props: {},
    };
  }
  const user = await findUser(query.user);
  return {
    props: { user: user, themeMode: query.theme },
  };
}

export default function EditAccountPage({ user, themeMode }) {
  const [username, setUsername] = useState(user.username);
  const [usernameError, setUsernameError] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [password, setPassword] = useState(user.password);
  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <Head></Head>
      <CssBaseline />
      <BackButton path={'/?user=' + user.userId + '&theme=' + currentMode} />
      <LightDarkButton
        setTheme={setTheme}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
      />
      <Paper
        sx={{ margin: '5%', padding: '2em', borderRadius: '20px' }}
        elevation={3}
      >
        <Button
          variant="contained"
          size="large"
          onClick={async () => {
            const response = await fetch('../api/checkifexists', {
              method: 'POST',
              body: JSON.stringify({
                username: username,
              }),
            });
            const data = await response.json();
            if (username !== user.username && data.exists) {
              setUsernameError(true);
              return;
            }
            let newUser = JSON.parse(JSON.stringify(user));
            newUser.username = username;
            newUser.password = password;
            await fetch('../api/update-user', {
              method: 'POST',
              body: JSON.stringify({
                userId: user.userId,
                newUser: newUser,
              }),
            });
            router.push('/?user=' + user.userId + '&theme=' + currentMode);
          }}
        >
          Save
        </Button>
        <br />
        <br />
        <TextField
          label="new username"
          autoComplete="off"
          size="large"
          value={username}
          error={usernameError}
          helperText={usernameError ? 'username already exists' : ''}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameError(false);
          }}
        />
        <br />
        <br />
        <TextField
          size="large"
          label="new password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        <Button
          color="error"
          variant="outlined"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          Delete Account
        </Button>
      </Paper>
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Type your username to delete your account</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoComplete="off"
            onChange={(e) => setConfirmUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            onClick={async () => {
              if (confirmUsername !== user.username) {
                return;
              }
              await fetch('../api/delete-user', {
                method: 'POST',
                body: JSON.stringify({
                  userId: user.userId,
                }),
              });
              router.push('/login');
            }}
          >
            Delete Account
          </Button>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
