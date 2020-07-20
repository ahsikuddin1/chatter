import React from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from './posts';
import { getReposts } from './reposts';

export const fetchPosts = async () => {
  const response = await getPosts();
  const reposts = await getReposts();

  const repostsData = reposts.map((each: any) => ({
    ...each.post,
    repost: true,
    repost_by: each.user.username,
    created_at: each.created_at,
    id: each.id,
    post_id: each.post_id,
    comment_id: each.comment_id,
    repost_id: each.user.id
  }));

  return [...response, ...repostsData];
};

export const isLiked = (user: any, id: number) => {
  let liked = false;
  let like: any;

  if (user && user.likes) {
    like = user.likes.find(
      (one: any) => one.post_id === id || one.comment_id === id
    );
    if (like) {
      liked = true;
    }
  }

  return { liked, like };
};

export const isReposted = (user: any, id: number) => {
  let reposted = false;
  let repost: any;

  if (user && user.reposts) {
    repost = user.reposts.find(
      (one: any) => one.post_id === id || one.comment_id === id
    );
    if (repost) {
      reposted = true;
    }
  }

  return { reposted, repost };
};

export const getInitials = (post: any, name: string) => {
  let initialSplit,
    initials = '?';
  if (name) {
    initialSplit = name.split(' ');
  } else if (post.name) {
    initialSplit = post.name.split(' ');
  }
  if (initialSplit) {
    if (initialSplit[1] && initialSplit[1][0]) {
      initials = initialSplit[0][0] + initialSplit[1][0];
    } else {
      initials = initialSplit[0][0];
    }
  }

  return initials;
};

export const taggedContent = (content: string, users: any) => {
  const splitContent: any = content.split(' ');
  const tagged = splitContent.find((tag: any) => tag.startsWith('@'));
  const index = splitContent.indexOf(tagged);
  if (tagged) {
    const taggedUser: any = users.find(
      (user: any) => `@${user.username}` === tagged
    );

    if (taggedUser) {
      return (
        <>
          {splitContent.slice(0, index).join(' ')}
          <Link to={`/users/${taggedUser.username}`}> {tagged} </Link>
          {splitContent.slice(index + 1).join(' ')}
        </>
      );
    }
  }

  return content;
};