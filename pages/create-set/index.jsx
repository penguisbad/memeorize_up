import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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
  const user = await findUser(query.user);
  return {
    props: { user: user, themeMode: query.theme },
  };
}

export default function CreateSetPage({ user, themeMode }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [setType, setSetType] = useState('flashcards');
  const [invalidNameOpen, setInvalidNameOpen] = useState(false);
  const [invalidNameMessage, setInvalidNameMessage] = useState('');
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
        <Typography variant="h5">Name:</Typography>
        <br />
        <TextField
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <br />
        <Typography variant="h5">Description:</Typography>
        <br />
        <TextField
          autoComplete="off"
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />
        <br />
        <Typography variant="h5">Type:</Typography>
        <br />
        <Select value={setType} onChange={(e) => setSetType(e.target.value)}>
          <MenuItem value="flashcards">Flashcards</MenuItem>
          <MenuItem value="table">Table</MenuItem>
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="list">List</MenuItem>
        </Select>
        <br />
        <br />
        <Button
          variant="outlined"
          size="large"
          onClick={async () => {
            if (name === '') {
              setInvalidNameMessage('Provide a name');
              setInvalidNameOpen(true);
              return;
            }
            if (user.sets.findIndex((set) => set.name === name) != -1) {
              setInvalidNameMessage('Name already exists');
              setInvalidNameOpen(true);
              return;
            }
            let newUser = JSON.parse(JSON.stringify(user));
            newUser.sets.push({
              name: name,
              description: description === '' ? 'no description' : description,
              setType: setType,
              cards: [],
              text: '',
              rows: [],
              items: [],
            });
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
          Create Set
        </Button>
        <br />
      </Paper>
      <Dialog open={invalidNameOpen} onClose={() => setInvalidNameOpen(false)}>
        <DialogTitle>Invalid name</DialogTitle>
        <DialogContent>{invalidNameMessage}</DialogContent>
        <DialogActions>
          <Button onClick={() => setInvalidNameOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
