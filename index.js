const { ApolloServer, gql } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  """
  Location or place
  """
  type Location {
      id: Int
      name: String!
      lat: String
      long: String
      address: Address
      locationType: LocationType
      description: String
      notes: [Note]
  }

  """
  Address of a location/place
  """
  type Address {
      id: Int
      value: String
      street: String
      city: String
      country: String
      state: String
      postalCode: Int
  }

  """
  Different types of location
  """
  enum LocationType {
      MOKUPUNI
      MOKU
      AHUPUAA
      ILI
      CITY
      STATE
      COUNTRY
  }

  """
  Different types of names, assigned at birth, marriage name, nicknames, etc.
  """
  enum NameType {
      BIRTH
      MARRIED
      AKA
      NICKNAME
      ADOPTIVE
      FORMAL
      RELIGIOUS
  }

  """
  Name struct
  """
  type Name {
      id: Int
      nameType: NameType
      first: String
      middle: [String]
      last: String
      givenBy: [Person]
      namedFrom: [Person]
      notes: [Note]
  }

  """
  Metadata about a citation source
  """
  type Citation {
      id: Int
      title: String
      author: Name
      page: String
      link: String
      dateAccessed: String
      datePublished: String
      notes: [Note]
      agents: [Agent]
  }


  """
  Common types: birth/death, marriage/divorce, religious, moving, census, adoption, childbirth
  """
  type LifeEvent {
      id: Int
      description: String
      date: String
      place: Location
      cause: String
      notes: [Note]
      citations: [Citation]
  }

  """
  Sex enum
  """
  enum Sex {
      MALE
      FEMALE
      OTHER
      UNKNOWN
  }

  """
  Free-form note added to an existing entity. Notes can be created/added/deleted by a signed-in user.
  """
  type Note {
      id: Int
      text: String
      title: String
      timestamp: String
      author: String
  }

  """
  Identifiers for the person responsible for linking the given data
  """
  type Agent {
      id: Int
      names: [Name]
      links: [String]
      phone: Int
      email: [String]
  }

  """
  An association that people can be tied to throughout their life (e.g. halau, clubs, sports)
  """
  type Group {
      id: Int
      names: [Name]
      place: Location
      description: String
      notes: [Note]
      citations: [Citation]
      links: [String]
  }

  """
  Metadata about a school
  """
  type School {
      id: Int
      names: [Name]
      location: Location
      description: String
      notes: [Note]
      citations: [Citation]
      links: [String]
  }

  """
  Do not store media directly, have a reference link
  """
  type Media {
      id: Int
      link: String
      description: String
      altText: String
  }

  """
  Core struct for a given person
  """
  type Person {
      id: Int
      name: [Name]
      sex: Sex
      birth: LifeEvent    # relationship to place
      death: LifeEvent    # relationship to place
      events: [LifeEvent]
      groups: [Group]
      schools: [School]  # relationship to school with attendance dates/graduation/teachers
      notes: [Note]
      parents: [Person]
      children: [Person]
      links: [String]
  }

  """
  Search result struct for a list of people
  """
  type PersonSearchResult {
      id: Int
      timestamp: String
      results: [Person]
      total: Int
      count: Int
      offset: Int
  }

  """
  Search result struct for a list of places
  """
  type PlaceSearchResult {
      id: Int
      timestamp: String
      results: [Location]
      total: Int
      count: Int
      offset: Int
  }

  type Query {
      """
      Get a person by person ID
      """
      getPerson(id: Int!): Person  
      """
      Get a paginated list of people
      """                           
      getPeople(limit: Int, offset: Int): [Person]
      """
      Get the shortest path between two people (how is this person related?)
      """                           
      getShortestPath(person1: Int!, person2: Int!): [Person]
      """
      Full-text string search for a person
      """                           
      searchPeople(text: String!): [Person]
      """
      Full-text string search for a place
      """                           
      searchPlaces(text: String!): [Location]
  }
`;

const people = [
    {
        id: 1,
        name: 'Jason Momoa',
        sex: 'M',
        birth: {
            date: '1982-01-01',
            place: {
                name: 'Honolulu'
            }
        },
        parents: [
            {
                id: 3,
                name: 'Mommy Momoa',
                sex: 'F',
                birth: {
                    date: '1959-01-01',
                    place: {
                        name: 'Hilo'
                    }
                }
            },
        ]
    },
    {
        id: 2,
        name: 'Aulii Cravalho',
        sex: 'F',
        birth: {
            date: '1995-01-01',
            place: {
                name: 'Honolulu'
            }
        },
        parents: [
            {
                id: 4,
                name: 'Mommy Cravalho',
                sex: 'F',
                birth: {
                    date: '1973-01-01',
                    place: {
                        name: 'Lihue'
                    }
                }
            },
        ]
    },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves people from the "people" array above.
const resolvers = {
    Query: {
        getPeople: () => people,
        getShortestPath: (p1, p2) => people
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});