import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import UpIcon from '@mui/icons-material/ArrowDropUp';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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

export default function EditListPage({ user, name, themeMode }) {
  const [items, setItems] = useState(
    user.sets.find((set) => set.name === name).items
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
            newUser.sets.find((set) => set.name === name).items = items;
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
          {(() => {
            let itemStacks = [];
            for (let i = 0; i < items.length; i++) {
              itemStacks.push(
                <Stack spacing={3} direction="row">
                  <TextField
                    sx={{ minWidth: '30%' }}
                    autoComplete="off"
                    value={items[i]}
                    onChange={(e) => {
                      let newItems = [...items];
                      newItems[i] = e.target.value;
                      setItems(newItems);
                    }}
                  />
                  <IconButton
                    size="large"
                    onClick={(e) => {
                      if (i === 0) {
                        return;
                      }
                      let newItems = [...items];
                      [newItems[i], newItems[i - 1]] = [
                        newItems[i - 1],
                        newItems[i],
                      ];
                      setItems(newItems);
                    }}
                  >
                    <UpIcon />
                  </IconButton>
                  <IconButton
                    size="large"
                    onClick={() => {
                      if (i === items.length - 1) {
                        return;
                      }
                      let newItems = [...items];
                      [newItems[i], newItems[i + 1]] = [
                        newItems[i + 1],
                        newItems[i],
                      ];
                      setItems(newItems);
                    }}
                  >
                    <DownIcon />
                  </IconButton>
                  <IconButton size="large">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              );
            }
            return itemStacks;
          })()}
        </Stack>
        <br />
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => {
            let newItems = [...items];
            newItems.push('');
            setItems(newItems);
          }}
        >
          Add
        </Button>
      </Paper>
    </ThemeProvider>
  );
}
