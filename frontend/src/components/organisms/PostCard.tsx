import { Box, Text, Flex, IconButton } from "@chakra-ui/react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useState } from "react";
import { likePost, unlikePost } from "../../services/posts";
import { type Publicacion } from "../../services/posts";

interface Props {
  post: Publicacion;
}

export const PostCard = ({ post }: Props) => {
  const [liked, setLiked] = useState(post.liked_by_user);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const toggleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post.id);
        setLikesCount((prev) => prev - 1);
      } else {
        await likePost(post.id);
        setLikesCount((prev) => prev + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error("Error cambiando like:", err);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="xl" p={3} mb={3} bg="gray.700" color="white" shadow="md">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="bold">{post.usuario}</Text>
        <Text fontSize="xs" color="gray.300">
          {new Date(post.fecha_creacion).toLocaleString()}
        </Text>
      </Flex>
      <Text fontSize="sm" mb={2}>
        {post.contenido}
      </Text>
      <Flex align="center" gap={2}>
        <IconButton
          aria-label="like"
          size="sm"
          variant="ghost"
          color={liked ? "red.500" : "gray.400"}
          onClick={toggleLike}
        >
            {liked ? <FaHeart /> : <FaRegHeart />}
        </IconButton>
        <Text fontSize="xs" color="gray.400">
          {likesCount}
        </Text>
      </Flex>
    </Box>
  );
};