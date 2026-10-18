-- Namu Sessões - Seed Data
-- Todos os horários são gravados em UTC. As datas são relativas ao momento em que o
-- banco é criado, para que o teste continue válido em qualquer dia.

SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS professionals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty ENUM('psicologia', 'nutricao', 'educacao-fisica', 'yoga') NOT NULL,
  session_minutes INT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professional_id INT NOT NULL,
  starts_at DATETIME NOT NULL COMMENT 'UTC',
  ends_at DATETIME NOT NULL COMMENT 'UTC',
  FOREIGN KEY (professional_id) REFERENCES professionals(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'UTC',
  cancelled_at DATETIME NULL COMMENT 'UTC',
  FOREIGN KEY (slot_id) REFERENCES availability_slots(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Profissionais
INSERT INTO professionals (id, name, specialty, session_minutes, active) VALUES
(1, 'Dra. Helena Castro', 'psicologia', 50, 1),
(2, 'Dra. Paula Nogueira', 'nutricao', 30, 1),
(3, 'Carlos Menezes', 'educacao-fisica', 60, 1),
(4, 'Rafael Lima', 'yoga', 60, 0);

-- Usuários
INSERT INTO users (id, name, email) VALUES
(1, 'Ana Souza', 'ana.souza@example.com'),
(2, 'Bruno Alves', 'bruno.alves@example.com'),
(3, 'Carla Dias', 'carla.dias@example.com'),
(4, 'Diego Martins', 'diego.martins@example.com');

-- Horários de disponibilidade (UTC)
SET @today = UTC_DATE();
SET @soon = STR_TO_DATE(DATE_FORMAT(UTC_TIMESTAMP() + INTERVAL 10 HOUR, '%Y-%m-%d %H:00:00'), '%Y-%m-%d %H:%i:%s');

INSERT INTO availability_slots (id, professional_id, starts_at, ends_at) VALUES
-- Dra. Helena Castro (50 min)
(1,  1, @soon, @soon + INTERVAL 50 MINUTE),
(2,  1, TIMESTAMP(@today - INTERVAL 1 DAY, '14:00:00'), TIMESTAMP(@today - INTERVAL 1 DAY, '14:50:00')),
(3,  1, TIMESTAMP(@today + INTERVAL 2 DAY, '17:00:00'), TIMESTAMP(@today + INTERVAL 2 DAY, '17:50:00')),
(4,  1, TIMESTAMP(@today + INTERVAL 2 DAY, '18:00:00'), TIMESTAMP(@today + INTERVAL 2 DAY, '18:50:00')),
(5,  1, TIMESTAMP(@today + INTERVAL 3 DAY, '02:00:00'), TIMESTAMP(@today + INTERVAL 3 DAY, '02:50:00')),
(6,  1, TIMESTAMP(@today + INTERVAL 3 DAY, '13:00:00'), TIMESTAMP(@today + INTERVAL 3 DAY, '13:50:00')),
(7,  1, TIMESTAMP(@today + INTERVAL 4 DAY, '13:00:00'), TIMESTAMP(@today + INTERVAL 4 DAY, '13:50:00')),
(8,  1, TIMESTAMP(@today + INTERVAL 5 DAY, '13:00:00'), TIMESTAMP(@today + INTERVAL 5 DAY, '13:50:00')),
-- Dra. Paula Nogueira (30 min)
(9,  2, TIMESTAMP(@today + INTERVAL 2 DAY, '17:30:00'), TIMESTAMP(@today + INTERVAL 2 DAY, '18:00:00')),
(10, 2, TIMESTAMP(@today + INTERVAL 2 DAY, '19:00:00'), TIMESTAMP(@today + INTERVAL 2 DAY, '19:30:00')),
(11, 2, TIMESTAMP(@today + INTERVAL 3 DAY, '12:00:00'), TIMESTAMP(@today + INTERVAL 3 DAY, '12:30:00')),
(12, 2, TIMESTAMP(@today + INTERVAL 3 DAY, '12:30:00'), TIMESTAMP(@today + INTERVAL 3 DAY, '13:00:00')),
-- Carlos Menezes (60 min)
(13, 3, TIMESTAMP(@today + INTERVAL 2 DAY, '20:00:00'), TIMESTAMP(@today + INTERVAL 2 DAY, '21:00:00')),
(14, 3, TIMESTAMP(@today + INTERVAL 3 DAY, '21:00:00'), TIMESTAMP(@today + INTERVAL 3 DAY, '22:00:00')),
-- Rafael Lima (60 min, profissional inativo)
(15, 4, TIMESTAMP(@today + INTERVAL 2 DAY, '13:00:00'), TIMESTAMP(@today + INTERVAL 2 DAY, '14:00:00'));

-- Agendamentos
INSERT INTO bookings (id, slot_id, user_id, status, created_at, cancelled_at) VALUES
(1, 1, 1, 'confirmed', UTC_TIMESTAMP() - INTERVAL 2 DAY, NULL),
(2, 3, 2, 'confirmed', UTC_TIMESTAMP() - INTERVAL 1 DAY, NULL),
(3, 7, 3, 'cancelled', UTC_TIMESTAMP() - INTERVAL 3 DAY, UTC_TIMESTAMP() - INTERVAL 2 DAY),
(4, 7, 4, 'confirmed', UTC_TIMESTAMP() - INTERVAL 1 DAY, NULL),
(5, 8, 1, 'confirmed', UTC_TIMESTAMP() - INTERVAL 1 DAY, NULL);
