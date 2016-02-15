create table projects (
id serial primary key,
url varchar(255) null,
title varchar(255) not null,
description text not null,
created_at timestamp not null default current_timestamp
);