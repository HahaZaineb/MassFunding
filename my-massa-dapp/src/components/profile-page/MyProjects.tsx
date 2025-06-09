

import { motion } from 'framer-motion';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useProjects } from '@/context/project-context';
import Stats from './Stats';
import NoProjectFound from './NoProjectFound';
import MyProjectCard from './MyProjectCard';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stats/>
      {myProjects.length > 0 ? (
        <div className="space-y-8">
          {myProjects.map((project, index) => (
            <motion.div
              key={project.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MyProjectCard project={project}/>
            </motion.div>
          ))}
        </div>
      ) : (
        <NoProjectFound/>
      )}
    </motion.div>
  );
}
