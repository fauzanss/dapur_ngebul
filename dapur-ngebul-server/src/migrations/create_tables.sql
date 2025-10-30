create table if not exists menu_items
(
    id          int auto_increment
        primary key,
    sku         varchar(50)                          null,
    name        varchar(255)                         not null,
    description text                                 null,
    price       decimal(10, 2)                       not null,
    category    varchar(100)                         null,
    available   tinyint(1) default 1                 null,
    created_at  timestamp  default CURRENT_TIMESTAMP null,
    updated_at  timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint sku
        unique (sku)
);

create table if not exists orders
(
    id            int auto_increment
        primary key,
    order_uuid    varchar(36)                           not null,
    total_amount  decimal(12, 2)                        not null,
    paid_amount   decimal(12, 2)                        null,
    status        varchar(50) default 'PENDING'         null,
    cashier       varchar(100)                          null,
    customer_name varchar(100)                          null,
    created_at    timestamp   default CURRENT_TIMESTAMP null
);

create table if not exists order_items
(
    id           int auto_increment
        primary key,
    order_id     int            not null,
    menu_item_id int            not null,
    name         varchar(255)   null,
    price        decimal(10, 2) null,
    quantity     int default 1  null,
    note         text           null,
    constraint order_items_ibfk_1
        foreign key (order_id) references orders (id)
            on delete cascade,
    constraint order_items_ibfk_2
        foreign key (menu_item_id) references menu_items (id)
);

create index menu_item_id
    on order_items (menu_item_id);

create index order_id
    on order_items (order_id);

create table if not exists printer_configs
(
    id         int auto_increment
        primary key,
    name       varchar(255)                        null,
    type       varchar(50)                         null,
    address    varchar(255)                        null,
    created_at timestamp default CURRENT_TIMESTAMP null
);

create table if not exists sales_records
(
    id         int auto_increment
        primary key,
    order_id   int                                 not null,
    date       date                                null,
    total      decimal(12, 2)                      null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    constraint sales_records_ibfk_1
        foreign key (order_id) references orders (id)
);

create index order_id
    on sales_records (order_id);

