// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex' {
  export interface Tables {
    users: {
      id: string
      session_id?: string
      first_name: string
      last_name: string
      photo_url: string
      created_at: Date
      updated_at?: Date
    }
    meals: {
      id: string
      date?: Date
      time?: Date
      name: string
      user_id: string
      on_diet: boolean
      created_at: Date
      updated_at?: Date
      description: string
    }
  }
}
