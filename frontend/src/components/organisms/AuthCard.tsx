import type { ReactNode } from 'react';
import { Box, Stack, Heading } from '@chakra-ui/react';

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

export const AuthCard = ({ title, children }: AuthCardProps) => {
  return (
    <Box
      maxW="700px"
      w="100%"
      mx="auto"
      mt="20"
      p="10"
      px="16"
      bg="gray.900"
      borderRadius="xl"
      boxShadow="lg"
    >
      <Stack gap="6">
        <Heading textAlign="center" color="white" fontSize="2xl">
          {title}
        </Heading>

        {children}
      </Stack>
    </Box>
  );
};