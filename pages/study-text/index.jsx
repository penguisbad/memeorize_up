import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import random from '../random';
import getChoices from '../choices';
import { findUser } from '../fetchData';
import { useState, useEffect } from 'react';
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

export default function StudyTextPage({ user, name, themeMode }) {
  const words = user.sets.find((set) => set.name === name).text.split(' ');
  const [hidden, setHidden] = useState([]);
  const [textFields, setTextFields] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [tab, setTab] = useState(0);
  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);

  const createHidden = (chance) => {
    let indices = [];
    let previousIndexHidden = false;
    for (let i = 0; i < words.length; i++) {
      if (random(0, chance) === 0 && !previousIndexHidden) {
        indices.push(i);
        previousIndexHidden = true;
      } else if (previousIndexHidden) {
        previousIndexHidden = false;
      }
    }
    let t = [];
    let b = [];
    for (const index of indices) {
      t.push({
        index: index,
        text: '',
        error: false,
      });
      const choices = getChoices(words, index);
      b.push({
        index: index,
        choices: choices,
        errors: (() => {
          let e = {};
          for (const choice of choices) {
            e[choice] = false;
          }
          return e;
        })(),
      });
    }
    setTextFields(t);
    setButtons(b);
    setHidden(indices);
  };

  useEffect(() => {
    createHidden(10);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head></Head>
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
          <Tab label="multiple choice" />
          <Tab label="write" />
        </Tabs>
        <br />
        <Typography variant="h5" sx={{ lineHeight: '2em' }}>
          {(() => {
            let content = [];
            for (let i = 0; i < words.length; i++) {
              if (hidden.includes(i)) {
                if (tab === 1) {
                  let textField = textFields.find((t) => t.index === i);
                  content.push(
                    <TextField
                      variant="filled"
                      size="small"
                      error={textField.error}
                      autoComplete="off"
                      hiddenLabel
                      onChange={(e) => {
                        let newTextFields = JSON.parse(
                          JSON.stringify(textFields)
                        );
                        let newTextField = newTextFields.find(
                          (t) => t.index === i
                        );
                        newTextField.text = e.target.value;
                        newTextField.error = false;
                        setTextFields(newTextFields);
                      }}
                    />
                  );
                  content.push(
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        if (
                          textField.text
                            .replace(/\.|\?|\!|\(|\)|,/gm, '')
                            .toUpperCase() ===
                          words[i]
                            .replace(/\.|\?|\!|\(|\)|,/gm, '')
                            .toUpperCase()
                        ) {
                          setHidden(hidden.filter((index) => index !== i));
                        } else {
                          let newTextFields = JSON.parse(
                            JSON.stringify(textFields)
                          );
                          newTextFields.find((t) => t.index === i).error = true;
                          setTextFields(newTextFields);
                        }
                      }}
                    >
                      Check
                    </Button>
                  );
                } else {
                  let buttonGroup = buttons.find((b) => b.index === i);
                  content.push(
                    <ButtonGroup variant="text" size="small">
                      {(() => {
                        return buttonGroup.choices.map((choice) => (
                          <Button
                            variant="text"
                            size="small"
                            color={
                              buttonGroup.errors[choice] ? 'error' : 'primary'
                            }
                            sx={
                              buttonGroup.errors[choice]
                                ? {
                                    textDecoration: 'line-through',
                                    textDecorationThickness: '2px',
                                  }
                                : null
                            }
                            onClick={() => {
                              if (choice === words[i]) {
                                setHidden(
                                  hidden.filter((index) => index !== i)
                                );
                              } else {
                                let newButtons = JSON.parse(
                                  JSON.stringify(buttons)
                                );
                                newButtons.find((b) => b.index === i).errors[
                                  choice
                                ] = true;
                                setButtons(newButtons);
                              }
                            }}
                          >
                            {choice.replace(/\.|\?|\!|\(|\)|,/gm, '')}
                          </Button>
                        ));
                      })()}
                    </ButtonGroup>
                  );
                }
                content.push(' ');
              } else {
                content.push(words[i] + ' ');
              }
            }
            return content;
          })()}
        </Typography>
        <br />

        <ButtonGroup variant="outlined" size="large">
          <Button onClick={() => createHidden(12)}>Regenerate level 1</Button>
          <Button onClick={() => createHidden(9)}>Regenerate level 2</Button>
          <Button onClick={() => createHidden(6)}>Regenerate level 3</Button>
          <Button onClick={() => createHidden(3)}>Regenerate level 4</Button>
        </ButtonGroup>
      </Paper>
    </ThemeProvider>
  );
}
