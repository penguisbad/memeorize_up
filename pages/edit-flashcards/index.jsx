import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
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

export default function EditFlashcardsPage({ user, name, themeMode }) {
  const [flashcards, setFlashcards] = useState(
    user.sets
      .find((set) => set.name === name)
      .cards.map((card) => {
        return {
          front: card.front,
          back: card.back,
          id: crypto.randomUUID(),
        };
      })
  );
  const router = useRouter();
  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);

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
            const newCards = JSON.parse(JSON.stringify(flashcards)).map(
              (card) => {
                return {
                  front: card.front,
                  back: card.back,
                };
              }
            );
            newUser.sets.find((set) => set.name === name).cards = newCards;
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
        <Stack spacing={2}>
          {flashcards.map((card) => (
            <Stack key={card.id} direction="row" spacing={3}>
              <TextField
                sx={{ minWidth: '30%' }}
                value={card.front}
                autoComplete="off"
                onChange={(e) => {
                  let newCards = [...flashcards];
                  newCards.find((c) => c.id === card.id).front = e.target.value;
                  setFlashcards(newCards);
                }}
              />
              <TextField
                sx={{ minWidth: '30%' }}
                value={card.back}
                autoComplete="off"
                onChange={(e) => {
                  let newCards = [...flashcards];
                  newCards.find((c) => c.id === card.id).back = e.target.value;
                  setFlashcards(newCards);
                }}
              />
              <IconButton
                size="large"
                onClick={() => {
                  setFlashcards(flashcards.filter((c) => c.id !== card.id));
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>
        <br />
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => {
            let newCards = [...flashcards];
            newCards.push({
              front: '',
              back: '',
              id: crypto.randomUUID(),
            });
            setFlashcards(newCards);
          }}
        >
          Add
        </Button>
      </Paper>
    </ThemeProvider>
  );
}
