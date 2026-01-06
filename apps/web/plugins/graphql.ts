import { GraphQLClient } from 'graphql-request'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const client = new GraphQLClient(config.public.graphqlEndpoint)
  return {
    provide: {
      gql: client
    }
  }
})



