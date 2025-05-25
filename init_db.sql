drop table if exists playlist_contents;
drop table if exists playlists;
drop table if exists songs;
drop table if exists genres;
drop table if exists users;

create table users
(
    id       int auto_increment,
    username varchar(32) not null unique,
    password varchar(32) not null,
    name     varchar(32) not null,
    surname  varchar(32) not null,
    primary key (id)
);

load data local infile 'docs/users.tsv'
    into table users
    fields terminated by '\t'
    enclosed by '\t'
    lines terminated by '\n'
    ignore 1 lines
    (id, username, password, name, surname);

create table genres
(
    name varchar(32),
    primary key (name)
);

#source: https://en.wikipedia.org/wiki/List_of_music_genres_and_styles
load data local infile 'docs/genres.tsv'
    into table genres
    fields terminated by '\t'
    enclosed by '\t'
    lines terminated by '\n'
    ignore 1 lines
    (name);

create table songs
(
    id              int auto_increment,
    user_id         int          not null,
    title           varchar(64)  not null,
    image_file_name varchar(64)  not null,
    album_title     varchar(64)  not null,
    performer       varchar(64)  not null, #interprete
    year            int          not null check ( year > 0 ),
    genre           varchar(64)  not null,
    music_file_name varchar(128) not null,
    primary key (id),
    foreign key (user_id) references users (id) on update cascade on delete no action,
    foreign key (genre) references genres (name) on update cascade on delete no action,
    unique (user_id, music_file_name)
);

load data local infile 'docs/songs.tsv'
    into table songs
    fields terminated by '\t'
    enclosed by '\t'
    lines terminated by '\n'
    ignore 1 lines
    (id, user_id, title, image_file_name, album_title, performer, year, genre, music_file_name);

create table playlists
(
    id               int auto_increment,
    user_id          int         not null,
    title            varchar(64) not null,
    date             date        not null default current_date,
    has_custom_order boolean     not null default false,
    primary key (id),
    unique (user_id, title)
);

load data local infile 'docs/playlists.tsv'
    into table playlists
    fields terminated by '\t'
    enclosed by '\t'
    lines terminated by '\n'
    ignore 1 lines
    (id, user_id, title, @creation_date)
    SET date = STR_TO_DATE(@creation_date, '%Y-%m-%d');

create table playlist_contents
(
    playlist  int,
    song      int,
    custom_id int default null,
    primary key (playlist, song),
    foreign key (playlist) references playlists (id) on update cascade on delete no action,
    foreign key (song) references songs (id) on update cascade on delete no action
);

load data local infile 'docs/playlist_contents.tsv'
    into table playlist_contents
    fields terminated by '\t'
    enclosed by '\t'
    lines terminated by '\n'
    ignore 1 lines
    (playlist, song);
