// A autenticação está fora do escopo: a tela deixa escolher um dos usuários do seed,
// e o id escolhido vai no header X-User-Id.
export const SEED_USERS = [
  { id: 1, name: 'Ana Souza', email: 'ana.souza@example.com', initials: 'AS' },
  { id: 2, name: 'Bruno Alves', email: 'bruno.alves@example.com', initials: 'BA' },
  { id: 3, name: 'Carla Dias', email: 'carla.dias@example.com', initials: 'CD' },
  { id: 4, name: 'Diego Martins', email: 'diego.martins@example.com', initials: 'DM' },
] as const;

export type SeedUserId = (typeof SEED_USERS)[number]['id'];
export type SeedUser = (typeof SEED_USERS)[number];
