import { motion } from 'framer-motion';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useProjects } from '@/context/project-context';
import Stats from './Stats';
import NoProjectFound from './NoProjectFound';
import MyProjectCard from './MyProjectCard';
import { Card, CardContent, Divider, styled } from '@mui/material';
import SectionHeader from '../SectionHeader';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

export default function MyProjects() {
  const { projects } = useProjects();
  const { connectedAccount } = useAccountStore();

  const myProjects = connectedAccount
    ? projects.filter((p) => {
        const creatorAddress = (p.creator?.toString() || '').toLowerCase();
        const connectedAddress = connectedAccount.address
          .toString()
          .toLowerCase();
        const match = creatorAddress === connectedAddress;
        return match;
      })
    : [];
  const StyledCard = styled(Card)(() => ({
    backgroundColor: '#11182f',
    color: '#e0e0e0',
    border: '1px solid #1f2a48',
    borderRadius: 12,
  }));
  return (
    <StyledCard sx={{ mb: 4 }} className="bg-gradient-to-br">
      <CardContent>
        <SectionHeader
          icon={WorkOutlineIcon}
          title="My Projects"
          color="#4caf50"
        />
        <Divider sx={{ my: 2, borderColor: '#1f2a48' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stats />
          {myProjects.length > 0 ? (
            <div className="space-y-8">
              {myProjects.map((project, index) => (
                <motion.div
                  key={project.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MyProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <NoProjectFound />
          )}
        </motion.div>
      </CardContent>
    </StyledCard>
  );
}
