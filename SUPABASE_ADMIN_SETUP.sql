-- SUPABASE_ADMIN_SETUP.sql
-- Execute este script no SQL Editor do Supabase

-- Cria extension caso necessário para gen_random_uuid()
create extension if not exists pgcrypto;

-- Cria tabela de administradores da aplicação
create table if not exists public.app_admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Insere o admin solicitado
insert into public.app_admins (email, role)
values ('erikfabiano082@gmail.com', 'admin')
on conflict (email) do update set role = excluded.role;

-- Observações:
-- 1) Crie o usuário de autenticação (Auth > Users) no painel do Supabase
--    com o email e senha abaixo:
--    Email: erikfabiano082@gmail.com
--    Senha: chamados123
-- 2) Depois execute este script para garantir que o email esteja na tabela app_admins.
-- 3) O frontend já verifica se o email autenticado existe em app_admins; caso contrário, a sessão é encerrada.
