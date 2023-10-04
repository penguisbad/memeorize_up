import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { findUser } from '../fetchData';
import LightDarkButton from '../../components/lightDarkButton';
import BackButton from '../../components/backButton';
import { darkTheme, lightTheme } from '../themes';

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
  if (query.name == null) {
    return {
      redirect: {
        permanent: false,
        destination: '/?user=' + query.user,
      },
      props: {},
    };
  }
  const user = await findUser(query.user);
  return {
    props: { user: user, name: query.name, themeMode: query.theme },
  };
}

export default function EditTextPage({ user, name, themeMode }) {
  console.log(JSON.stringify(user));
  const [text, setText] = useState(
    user.sets.find((set) => set.name === name).text
  );
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
            let newUser = JSON.parse(JSON.stringify(user));
            newUser.sets.find((set) => set.name === name).text = text;
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
          multiline
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Paper>
    </ThemeProvider>
  );
}
