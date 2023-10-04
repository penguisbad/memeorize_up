import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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

export default function StudyTablePage({ user, name, themeMode }) {
  const rows = user.sets.find((set) => set.name === name).rows;
  const [tab, setTab] = useState(0);
  const [hidden, setHidden] = useState([]);
  const [selects, setSelects] = useState([]);
  const [textFields, setTextFields] = useState([]);
  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);

  const createHidden = (chance) => {
    let indices = [];
    let s = [];
    let t = [];
    for (let i = 0; i < rows.length; i++) {
      for (let k = 0; k < rows[i].length; k++) {
        if (random(0, chance) === 0) {
          indices.push([i, k]);
          let choices = [];
          let r = random(0, 4);
          const flattenedRows = rows.flat();
          for (let j = 0; j < 4; j++) {
            if (r === j) {
              choices.push(rows[i][k]);
            } else {
              let randomChoice;
              do {
                randomChoice = flattenedRows[random(0, flattenedRows.length)];
              } while (
                randomChoice === rows[i][k] ||
                choices.includes(randomChoice)
              );
              choices.push(randomChoice);
            }
          }
          s.push({
            index: [i, k],
            value: 'default',
            choices: choices,
            error: false,
          });
          t.push({
            index: [i, k],
            text: '',
            error: false,
          });
        }
      }
    }
    setSelects(s);
    setTextFields(t);
    setHidden(indices);
  };

  useEffect(() => {
    createHidden(2);
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
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          fullWidth
          size="large"
        >
          <Tab label="Multiple choice" />
          <Tab label="Write" />
        </Tabs>
        <br />
        <Stack spacing={3} sx={{ overflow: 'scroll', padding: '1.01em' }}>
          {(() => {
            let rowStacks = [];
            for (let i = 0; i < rows.length; i++) {
              rowStacks.push(
                <Stack direction="row" spacing={2}>
                  {(() => {
                    let cells = [];
                    const cellStyle = {
                      width: '250px',
                      minWidth: '250px',
                      maxWidth: '250px',
                      padding: '1.01em',
                    };
                    /*
                      borderColor: 'white',
                      borderStyle: 'solid',
                      borderWidth: '1px',
                    };
                    */
                    for (let k = 0; k < rows[i].length; k++) {
                      if (
                        hidden.findIndex(
                          (index) => index[0] === i && index[1] === k
                        ) !== -1
                      ) {
                        if (tab === 0) {
                          const select = selects.find(
                            (select) =>
                              select.index[0] === i && select.index[1] === k
                          );
                          cells.push(
                            <Paper sx={cellStyle} elevation={5}>
                              <TextField
                                sx={{ paddingTop: '20px' }}
                                select
                                size="small"
                                value={select.value}
                                error={select.error}
                                fullWidth
                                onChange={(e) => {
                                  if (e.target.value === rows[i][k]) {
                                    setHidden(
                                      hidden.filter(
                                        (index) =>
                                          index[0] !== i || index[1] !== k
                                      )
                                    );
                                  } else {
                                    let newSelects = JSON.parse(
                                      JSON.stringify(selects)
                                    );
                                    let newSelect = newSelects.find(
                                      (s) =>
                                        s.index[0] === i && s.index[1] === k
                                    );
                                    newSelect.error = true;
                                    newSelect.value = e.target.value;
                                    setSelects(newSelects);
                                  }
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
                          const textField = textFields.find(
                            (t) => t.index[0] === i && t.index[1] === k
                          );
                          cells.push(
                            <Paper sx={cellStyle} elevation={5}>
                              <Stack direction="row" sx={cellStyle}>
                                <TextField
                                  variant="filled"
                                  hiddenLabel
                                  autoComplete="off"
                                  size="small"
                                  value={textField.text}
                                  error={textField.error}
                                  onChange={(e) => {
                                    let newTextFields = JSON.parse(
                                      JSON.stringify(textFields)
                                    );
                                    newTextFields.find(
                                      (t) =>
                                        t.index[0] === i && t.index[1] === k
                                    ).text = e.target.value;
                                    setTextFields(newTextFields);
                                  }}
                                />
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => {
                                    if (textField.text === rows[i][k]) {
                                      setHidden(
                                        hidden.filter(
                                          (index) =>
                                            index[0] !== i || index[1] !== k
                                        )
                                      );
                                    } else {
                                      let newTextFields = JSON.parse(
                                        JSON.stringify(textFields)
                                      );
                                      newTextFields.find(
                                        (t) =>
                                          t.index[0] === i && t.index[1] === k
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
                        cells.push(
                          <Paper sx={cellStyle} elevation={5}>
                            <Typography variant="h5" sx={cellStyle}>
                              {rows[i][k]}
                            </Typography>
                          </Paper>
                        );
                      }
                    }
                    return cells;
                  })()}
                </Stack>
              );
            }
            return rowStacks;
          })()}
        </Stack>
        <br />
        <ButtonGroup variant="outlined" size="large">
          <Button onClick={() => createHidden(8)}>Regenerate level 1</Button>
          <Button onClick={() => createHidden(6)}>Regenerate level 2</Button>
          <Button onClick={() => createHidden(4)}>Regenerate level 3</Button>
          <Button onClick={() => createHidden(2)}>Regenerate level 4</Button>
        </ButtonGroup>
      </Paper>
    </ThemeProvider>
  );
}
