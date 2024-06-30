exports.up = (pgm) => {
    pgm.createTable("blogs", {
        id: { type: "uuid", primaryKey: true },
        filename: { type: "varchar(100)", notNull: true },
        title: { type: "varchar(100)", notNull: true },
        author: { type: "varchar(100)", notNull: true },
        content: { type: "varchar", notNull: true },
        views: { type: "numeric", notNull: true },
        created_at: { type: "varchar", notNull: true },
    });
    pgm.createIndex("blogs", "id");
};
