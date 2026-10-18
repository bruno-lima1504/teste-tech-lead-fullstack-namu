'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCheck } from 'lucide-react';
import { useCurrentUser } from './current-user';
import { SEED_USERS, type SeedUserId } from './seed-users';

export function UserSelect() {
  const { userId, setUserId } = useCurrentUser();
  const activeUser = SEED_USERS.find(({ id }) => id === userId) ?? SEED_USERS[0];

  return (
    <div className="flex items-center gap-2.5">
      <span
        id="user-select-label"
        className="text-muted-foreground hidden items-center gap-1.5 text-xs font-medium sm:inline-flex"
      >
        <UserCheck className="text-primary-deep dark:text-primary size-3.5" />
        Você é
      </span>
      <Select
        value={String(userId)}
        onValueChange={(value) => setUserId(Number(value) as SeedUserId)}
      >
        <SelectTrigger
          aria-label="Você é"
          aria-labelledby="user-select-label"
          className="hover:border-primary/40 h-10 min-w-48 gap-2.5 rounded-full pl-1.5 pr-3.5"
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="bg-accent text-primary-deep dark:text-primary-glow text-[11px] font-bold">
                {activeUser.initials}
              </AvatarFallback>
            </Avatar>
            <SelectValue placeholder="Escolha o usuário">{activeUser.name}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="w-64">
          <SelectGroup>
            <SelectLabel>Alternar paciente (X-User-Id)</SelectLabel>
            {SEED_USERS.map((user) => (
              <SelectItem key={user.id} value={String(user.id)}>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-accent text-primary-deep dark:text-primary-glow text-[11px] font-bold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-muted-foreground text-xs">{user.email}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
