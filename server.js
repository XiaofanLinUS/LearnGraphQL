const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const app = express()
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql')
const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' },
    { id: 4, name: 'Sam Lin' }
]

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 },
    { id: 9, name: 'Book Name', authorId: 5 }
]

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "A book query",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => authors.find(author => author.id === book.authorId)
        }
    }),
})

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "An author query",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => books.filter(book => book.authorId === author.id)
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "A root query",
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: "List of all books",
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all authors",
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: "A single author",
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (_, args) => authors.find(author => author.id === args.id)
        },
        book: {
            type: BookType,
            description: "A single book",
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (_, args) => books.find(book => book.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "A Root Mutation",
    fields: {
        addBook: {
            type: BookType,
            description: "Adding a new book with a given name",
            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString)
                },
                authorId: {
                    type: GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (_, args) => {
                let book = { id: books.length + 1, name: args.name, authorId: args.authorId };
                books.push(book);
                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Adding a new author with a given name",
            args: {
                name: {
                    type: GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (_, args) => {
                let author = { id: authors.length + 1, name: args.name };
                authors.push(author);
                return author;
            }
        },
        updateBook: {
            type: BookType,
            description: "Update a book with a given id",
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLInt),
                },
                name: {
                    type: GraphQLString
                },
                authorId: {
                    type: GraphQLInt
                }
            },
            resolve: (_, args) => {
                const theBook = books.find(book => book.id === args.id);
                if (!theBook) return null;

                if (args.name) {
                    theBook.name = args.name;
                }

                if (args.authorId) {
                    theBook.authorId = args.authorId;
                }

                return theBook;
            }
        }

    }
});
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.listen(4000, () => console.log('Server Running'))