import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import { findUser } from '../fetchData';
import random from '../random';
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

export default function StudyFlashcardsPage({ user, name, themeMode }) {
  const cards = user.sets.find((set) => set.name === name).cards;
  const [tab, setTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [prompt2, setPrompt2] = useState('');
  const [answer, setAnswer] = useState('');
  const [choices, setChoices] = useState([]);
  const [choiceColors, setChoiceColors] = useState({});
  const [trueColor, setTrueColor] = useState('');
  const [falseColor, setFalseColor] = useState('');
  const [written, setWritten] = useState('');
  const [writtenColor, setWrittenColor] = useState('');
  const [previousCardIndex, setPreviousCardIndex] = useState(-1);
  const [delayed, setDelayed] = useState(false);

  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);

  const pickCard = () => {
    let cardIndex;
    do {
      cardIndex = random(0, cards.length);
    } while (cardIndex === previousCardIndex);
    setPreviousCardIndex(cardIndex);
    setPrompt(cards[cardIndex].front);

    let index;
    if (random(0, 2) === 0) {
      setPrompt2(cards[cardIndex].back);
    } else {
      do {
        index = random(0, cards.length);
      } while (cardIndex === index);
      setPrompt2(cards[index].back);
    }
    setAnswer(cards[cardIndex].back);

    let r = random(0, 4);
    let c = [];
    for (let i = 0; i < 4; i++) {
      if (i === r) {
        c.push(cards[cardIndex].back);
      } else {
        do {
          index = random(0, cards.length);
        } while (cardIndex == index || c.includes(cards[index].back));
        c.push(cards[index].back);
      }
    }
    let colors = {};
    for (const choice of c) {
      colors[choice] = 'primary';
    }
    setChoices(c);
    setChoiceColors(colors);
    setTrueColor('primary');
    setFalseColor('primary');
    setWrittenColor('primary');
  };

  useEffect(() => {
    pickCard();
  }, []);

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
        sx={{
          marginTop: '5%',
          marginLeft: '20%',
          marginRight: '20%',
          padding: '2em',
          borderRadius: '20px',
        }}
        elevation={3}
      >
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          fullWidth
          size="large"
        >
          <Tab label="multiple choice" />
          <Tab label="true / false" />
          <Tab label="write" />
        </Tabs>
        <br />
        <br />
        {tab === 0 && (
          <Stack spacing={3}>
            <Typography variant="h5">{prompt}</Typography>
            {choices.map((choice) => (
              <Button
                variant={
                  choiceColors[choice] === 'success' ? 'contained' : 'outlined'
                }
                size="large"
                color={choiceColors[choice]}
                onClick={() => {
                  if (delayed) {
                    return;
                  }
                  let newColors = JSON.parse(JSON.stringify(choiceColors));
                  if (choice === answer) {
                    newColors[choice] = 'success';
                  } else {
                    newColors[choice] = 'error';
                  }
                  setChoiceColors(newColors);
                  setDelayed(true);
                  setTimeout(() => {
                    pickCard();
                    setDelayed(false);
                  }, 1000);
                }}
              >
                {choice}
              </Button>
            ))}
          </Stack>
        )}
        {tab === 1 && (
          <Stack spacing={3}>
            <Typography variant="h5">{prompt}</Typography>
            <Typography variant="h5">{prompt2}</Typography>
            <Stack spacing={3} direction="row">
              <Button
                variant={trueColor === 'success' ? 'contained' : 'outlined'}
                size="large"
                color={trueColor}
                onClick={() => {
                  if (delayed) {
                    return;
                  }
                  if (prompt2 === answer) {
                    setTrueColor('success');
                  } else {
                    setTrueColor('error');
                  }
                  setDelayed(true);
                  setTimeout(() => {
                    pickCard();
                    setDelayed(false);
                  }, 1000);
                }}
              >
                True
              </Button>
              <Button
                variant={falseColor === 'success' ? 'contained' : 'outlined'}
                size="large"
                color={falseColor}
                onClick={() => {
                  if (delayed) {
                    return;
                  }
                  if (prompt2 === answer) {
                    setFalseColor('error');
                  } else {
                    setFalseColor('success');
                  }
                  setDelayed(true);
                  setTimeout(() => {
                    pickCard();
                    setDelayed(false);
                  }, 1000);
                }}
              >
                False
              </Button>
            </Stack>
          </Stack>
        )}
        {tab === 2 && (
          <Box>
            <Typography variant="h5">{prompt}</Typography>
            <br />
            <TextField
              sx={{ minWidth: '20%' }}
              value={written}
              color={writtenColor}
              autoComplete="off"
              focused
              onChange={(e) => setWritten(e.target.value)}
            />
            <br />
            <br />
            <Button
              variant={writtenColor === 'success' ? 'contained' : 'outlined'}
              size="large"
              color={writtenColor}
              onClick={() => {
                if (delayed) {
                  return;
                }
                if (written === answer) {
                  setWrittenColor('success');
                } else {
                  setWrittenColor('error');
                }
                setDelayed(true);
                setTimeout(() => {
                  pickCard();
                  setWritten('');
                  setDelayed(false);
                }, 1000);
              }}
            >
              Check answer
            </Button>
          </Box>
        )}
      </Paper>
    </ThemeProvider>
  );
}
