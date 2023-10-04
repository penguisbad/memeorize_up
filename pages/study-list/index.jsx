import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import UpIcon from '@mui/icons-material/ArrowDropUp';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import random from '../random';
import getChoices from '../choices';
import { useState, useEffect } from 'react';
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

export default function StudyListPage({ user, name, themeMode }) {
  const items = user.sets.find((set) => set.name === name).items;
  const [shuffledItems, setShuffledItems] = useState([]);
  const [correctIndices, setCorrectIndices] = useState([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [tab, setTab] = useState(0);
  const [hidden, setHidden] = useState([]);
  const [selects, setSelects] = useState([]);
  const [textFields, setTextFields] = useState([]);
  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);

  const shuffleArray = (a) => {
    let array = [...a];
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));

      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  };

  const createHidden = (chance) => {
    let indices = [];
    let s = [];
    let t = [];
    for (let i = 0; i < items.length; i++) {
      if (random(0, chance) === 0) {
        indices.push(i);
        t.push({
          index: i,
          text: '',
          error: false,
        });
        const choices = getChoices(items, i);
        s.push({
          index: i,
          choices: choices,
          error: false,
        });
      }
    }
    setTextFields(t);
    setSelects(s);
    setHidden(indices);
  };

  useEffect(() => {
    createHidden(2);
    setShuffledItems(shuffleArray(items));
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
        sx={{ margin: '5%', padding: '2em', borderRadius: '20px' }}
        elevation={3}
      >
        <Tabs
          size="large"
          fullWidth
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
        >
          <Tab label="multiple choice" />
          <Tab label="write" />
          <Tab label="rearrange" />
        </Tabs>
        <br />
        {(() => {
          if (tab === 2) {
            return (
              <Stack
                spacing={3}
                sx={{ minWidth: 'fit-content', maxWidth: 'fit-content' }}
              >
                {(() => {
                  let stacks = [];
                  for (let i = 0; i < shuffledItems.length; i++) {
                    let style;
                    if (showCorrect) {
                      if (correctIndices.includes(i)) {
                        style = {
                          padding: '1.01em',
                          backgroundColor: 'darkgreen',
                        };
                      } else {
                        style = {
                          padding: '1.01em',
                          borderColor: 'darkred',
                          borderThickness: '2px',
                          borderStyle: 'solid',
                        };
                      }
                    } else {
                      style = {
                        padding: '1.01em',
                      };
                    }
                    stacks.push(
                      <Paper sx={style} elevation={5}>
                        <Stack direction="row">
                          <Typography
                            sx={{ width: '100%', marginTop: '1%' }}
                            variant="h5"
                          >
                            {shuffledItems[i]}
                          </Typography>
                          <IconButton
                            onClick={() => {
                              if (i === 0) {
                                return;
                              }
                              let newShuffledItems = [...shuffledItems];
                              [newShuffledItems[i], newShuffledItems[i - 1]] = [
                                newShuffledItems[i - 1],
                                newShuffledItems[i],
                              ];
                              setShowCorrect(false);
                              setShuffledItems(newShuffledItems);
                            }}
                          >
                            <UpIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              if (i === shuffledItems.length - 1) {
                                return;
                              }
                              let newShuffledItems = [...shuffledItems];
                              [newShuffledItems[i], newShuffledItems[i + 1]] = [
                                newShuffledItems[i + 1],
                                newShuffledItems[i],
                              ];
                              setShowCorrect(false);
                              setShuffledItems(newShuffledItems);
                            }}
                          >
                            <DownIcon />
                          </IconButton>
                        </Stack>
                      </Paper>
                    );
                  }
                  return stacks;
                })()}
                <Stack direction="row" spacing={3}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ maxWidth: 'fit-content' }}
                    onClick={() => {
                      let newCorrectIndices = [];
                      for (let i = 0; i < shuffledItems.length; i++) {
                        if (shuffledItems[i] === items[i]) {
                          newCorrectIndices.push(i);
                        }
                      }
                      setCorrectIndices(newCorrectIndices);
                      setShowCorrect(true);
                    }}
                  >
                    Check
                  </Button>
                  <Button
                    size="large"
                    sx={{ maxWidth: 'fit-content' }}
                    variant="outlined"
                    onClick={() => {
                      setShowCorrect(false);
                      setShuffledItems(shuffleArray(items));
                    }}
                  >
                    Reshuffle
                  </Button>
                </Stack>
              </Stack>
            );
          } else {
            return (
              <Stack spacing={3} sx={{ maxWidth: 'fit-content' }}>
                {(() => {
                  let itemComponents = [];
                  for (let i = 0; i < items.length; i++) {
                    if (hidden.includes(i)) {
                      if (tab === 0) {
                        const select = selects.find((s) => s.index === i);
                        itemComponents.push(
                          <Paper sx={{ padding: '1.01em' }} elevation={5}>
                            <TextField
                              select
                              variant="outlined"
                              orientation="vertical"
                              fullWidth
                              size="small"
                              error={select.error}
                              onChange={(e) => {
                                if (e.target.value === items[i]) {
                                  setHidden(hidden.filter((h) => h !== i));
                                  return;
                                }
                                let newSelects = [...selects];
                                newSelects.find(
                                  (s) => s.index === i
                                ).error = true;
                                setSelects(newSelects);
                              }}
                            >
                              <MenuItem value="default">
                                Select a value
                              </MenuItem>
                              {select.choices.map((choice) => (
                                <MenuItem value={choice}>{choice}</MenuItem>
                              ))}
                            </TextField>
                          </Paper>
                        );
                      } else {
                        const textField = textFields.find((t) => t.index === i);
                        itemComponents.push(
                          <Paper sx={{ padding: '1.01em' }} elevation={5}>
                            <Stack direction="row" spacing={3}>
                              <TextField
                                variant="outlined"
                                error={textField.error}
                                autoComplete="off"
                                size="small"
                                onChange={(e) => {
                                  let newTextFields = [...textFields];
                                  newTextFields.find(
                                    (t) => t.index === i
                                  ).text = e.target.value;
                                  setTextFields(newTextFields);
                                }}
                              />
                              <Button
                                variant="text"
                                onClick={() => {
                                  if (textField.text === items[i]) {
                                    setHidden(hidden.filter((h) => h !== i));
                                  } else {
                                    let newTextFields = [...textFields];
                                    newTextFields.find(
                                      (t) => t.index === i
                                    ).error = true;
                                    setTextFields(newTextFields);
                                  }
                                }}
                              >
                                Check
                              </Button>
                            </Stack>
                          </Paper>
                        );
                      }
                    } else {
                      itemComponents.push(
                        <Paper sx={{ padding: '1.01em' }} elevation={5}>
                          <Typography variant="h5">{items[i]}</Typography>
                        </Paper>
                      );
                    }
                  }
                  return itemComponents;
                })()}
                <Button
                  size="large"
                  variant="outlined"
                  sx={{ maxWidth: 'fit-content' }}
                  onClick={() => createHidden(2)}
                >
                  Regenerate
                </Button>
              </Stack>
            );
          }
        })()}
      </Paper>
    </ThemeProvider>
  );
}
