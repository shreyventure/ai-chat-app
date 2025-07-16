export const formatDate = (d: string) => {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};
