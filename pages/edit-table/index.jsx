import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RightIcon from '@mui/icons-material/ArrowRight';
import LeftIcon from '@mui/icons-material/ArrowLeft';
import UpIcon from '@mui/icons-material/ArrowDropUp';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { findUser } from '../fetchData';
import LightDarkButton from '../../components/lightDarkButton';
import BackButton from '../../components/backButton';
import { lightTheme, darkTheme } from '../themes';

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

export default function EditTablePage({ user, name, themeMode }) {
  const [rows, setRows] = useState(
    user.sets.find((set) => set.name === name).rows
  );
  const [selectedIndex, setSelectedIndex] = useState([-10, -10]);
  const router = useRouter();
  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);

  const moveColumn = (direction) => {
    if (
      rows.length > 0 &&
      ((direction === 'right' && selectedIndex[1] === rows[0].length - 1) ||
        (direction === 'left' && selectedIndex[1] === 0))
    ) {
      return;
    }
    let newRows = [];
    for (let i = 0; i < rows.length; i++) {
      let rowToAdd = [];
      for (let k = 0; k < rows[i].length; k++) {
        if (k === selectedIndex[1]) {
          rowToAdd.push(rows[i][direction === 'right' ? k + 1 : k - 1]);
        } else if (k === selectedIndex[1] + 1 && direction === 'right') {
          rowToAdd.push(rows[i][k - 1]);
        } else if (k === selectedIndex[1] - 1 && direction === 'left') {
          rowToAdd.push(rows[i][k + 1]);
        } else {
          rowToAdd.push(rows[i][k]);
        }
      }
      newRows.push(rowToAdd);
    }
    setSelectedIndex([-10, -10]);
    setRows(newRows);
  };

  const moveRow = (direction) => {
    if (
      (direction === 'down' && selectedIndex[0] === rows.length - 1) ||
      (direction === 'up' && selectedIndex[0] === 0)
    ) {
      return;
    }
    let newRows = [];
    for (let i = 0; i < rows.length; i++) {
      if (i === selectedIndex[0]) {
        newRows.push(rows[direction === 'down' ? i + 1 : i - 1]);
      } else if (i === selectedIndex[0] + 1 && direction === 'down') {
        newRows.push(rows[i - 1]);
      } else if (i === selectedIndex[0] - 1 && direction === 'up') {
        newRows.push(rows[i + 1]);
      } else {
        newRows.push(rows[i]);
      }
    }
    setSelectedIndex([-10, -10]);
    setRows(newRows);
  };

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
            newUser.sets.find((set) => set.name === name).rows = rows;
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
        <Stack sx={{ overflow: 'scroll' }}>
          {(() => {
            let rowStacks = [];
            for (let i = 0; i < rows.length; i++) {
              rowStacks.push(
                <Stack direction="row">
                  {(() => {
                    let cells = [];
                    for (let k = 0; k < rows[i].length; k++) {
                      cells.push(
                        <TextField
                          value={rows[i][k]}
                          sx={{ minWidth: '200px' }}
                          onFocus={() => setSelectedIndex([i, k])}
                          autoComplete="off"
                          onChange={(e) => {
                            let newRows = JSON.parse(JSON.stringify(rows));
                            newRows[i][k] = e.target.value;
                            setRows(newRows);
                          }}
                        />
                      );
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
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              let newRows = JSON.parse(JSON.stringify(rows));
              let newRow = [];
              if (newRows.length > 0) {
                for (let i = 0; i < newRows[0].length; i++) {
                  newRow.push('');
                }
              }
              newRows.push(newRow);
              setRows(newRows);
            }}
          >
            Add Row
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              let newRows = JSON.parse(JSON.stringify(rows));
              for (let i = 0; i < newRows.length; i++) {
                newRows[i].push('');
              }
              setRows(newRows);
            }}
          >
            Add Column
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => {
              let newRows = [];
              for (let i = 0; i < rows.length; i++) {
                if (i !== selectedIndex[0]) {
                  newRows.push(rows[i]);
                }
              }
              setRows(newRows);
            }}
          >
            Delete Row
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => {
              let newRows = [];
              for (let i = 0; i < rows.length; i++) {
                let rowToAdd = [];
                for (let k = 0; k < rows[i].length; k++) {
                  if (k !== selectedIndex[1]) {
                    rowToAdd.push(rows[i][k]);
                  }
                }
                newRows.push(rowToAdd);
              }
              setRows(newRows);
            }}
          >
            Delete Column
          </Button>
        </ButtonGroup>
        <br />
        <br />
        <ButtonGroup variant="outlined" size="large">
          <Button startIcon={<RightIcon />} onClick={() => moveColumn('right')}>
            Move column right
          </Button>
          <Button startIcon={<LeftIcon />} onClick={() => moveColumn('left')}>
            Move column left
          </Button>
          <Button startIcon={<UpIcon />} onClick={() => moveRow('up')}>
            Move row up
          </Button>
          <Button startIcon={<DownIcon />} onClick={() => moveRow('down')}>
            Move row down
          </Button>
        </ButtonGroup>
      </Paper>
    </ThemeProvider>
  );
}
