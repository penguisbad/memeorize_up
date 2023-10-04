import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { findUser } from './fetchData';
import { darkTheme, lightTheme } from './themes';
import LightDarkButton from '../components/lightDarkButton';

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

export default function IndexPage({ user, themeMode }) {
  const [warningOpen, setWarningOpen] = useState(false);
  const [deleteName, setDeleteName] = useState('');
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [theme, setTheme] = useState(
    themeMode === 'dark' ? darkTheme : lightTheme
  );
  const [currentMode, setCurrentMode] = useState(themeMode);
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <Head></Head>
      <CssBaseline />
      <LightDarkButton
        setTheme={setTheme}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
      />
      <Paper
        sx={{ margin: '5%', padding: '2em', borderRadius: '20px' }}
        elevation={3}
      >
        {user.sets.length === 0 ? (
          <Typography variant="h5">no sets</Typography>
        ) : (
          user.sets.map((set) => (
            <Card
              sx={{
                display: 'inline-block',
                minWidth: '400px',
                marginRight: '1.1em',
                marginBottom: '1.1em',
              }}
              elevation={currentMode === 'dark' ? 6 : 2}
            >
              <CardContent>
                <Typography variant="h4">{set.name}</Typography>
                <Typography variant="h5" color="text.secondary">
                  {set.setType}
                </Typography>
                <br />
                <Typography varaint="h6">{set.description}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    router.push(
                      '/edit-' +
                        set.setType +
                        '?user=' +
                        user.userId +
                        '&name=' +
                        set.name +
                        '&theme=' +
                        currentMode
                    );
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<FilterNoneIcon />}
                  onClick={() => {
                    router.push(
                      '/study-' +
                        set.setType +
                        '?user=' +
                        user.userId +
                        '&name=' +
                        set.name +
                        '&theme=' +
                        currentMode
                    );
                  }}
                >
                  Study
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setDeleteName(set.name);
                    setWarningOpen(true);
                  }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))
        )}
        <br />
        <br />
        <Button
          size="large"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            router.push(
              '/create-set?user=' + user.userId + '&theme=' + currentMode
            )
          }
        >
          Create Set
        </Button>
        <br />
        <br />
        <Button
          size="large"
          variant="outlined"
          sx={{ marginRight: '1.1em' }}
          endIcon={<ManageAccountsOutlinedIcon />}
          onClick={() => {
            router.push(
              '/edit-account?user=' + user.userId + '&theme=' + currentMode
            );
          }}
        >
          Manage Account
        </Button>
        <Button
          size="large"
          variant="outlined"
          endIcon={<LogoutOutlinedIcon />}
          onClick={() => setSignOutConfirmOpen(true)}
        >
          Sign out
        </Button>
      </Paper>
      <Dialog open={warningOpen} onClose={() => setWarningOpen(false)}>
        <DialogTitle>Are you sure you want to delete {deleteName}?</DialogTitle>
        <DialogActions>
          <Button
            color="error"
            onClick={async () => {
              let newUser = JSON.parse(JSON.stringify(user));
              newUser.sets = newUser.sets.filter(
                (set) => set.name !== deleteName
              );
              setWarningOpen(false);
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
            Delete
          </Button>
          <Button onClick={() => setWarningOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={signOutConfirmOpen}
        onClose={() => setSignOutConfirmOpen(false)}
      >
        <DialogTitle>Are you sure you want to sign out?</DialogTitle>
        <DialogActions>
          <Button onClick={() => router.push('/login')}>Sign Out</Button>
          <Button onClick={() => setSignOutConfirmOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
