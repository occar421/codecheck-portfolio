create table tags (
project_id int references projects(id),
name varchar(255) null
);