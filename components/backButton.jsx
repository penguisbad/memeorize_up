import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from 'next/navigation';

export default function BackButton({ path }) {
  const router = useRouter();
  return (
    <IconButton
      sx={{ position: 'absolute', left: '10px', top: '10px' }}
      size="large"
      variant="contained"
      onClick={() => {
        router.push(path);
      }}
    >
      <ArrowBackIosNewIcon />
    </IconButton>
  );
}
