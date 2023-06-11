const fetch = require('node-fetch')

const query = `
query GetEntriesCSSA($lang: String, $type: String!, $entriesProtectionLang2: String) {
entriesCsssa(lang: $lang) {
  legal
  entry_csssa_penalty {
    id
    name
    map_color
  }
  legal_framework_decrim_mechanism {
    id
    name
  }
  entry_csssa_death_penalty_value {
    id
    name
  }
  motherEntry {
    jurisdiction {
      name
      a2_code
    }
}
entry_csssa_max_prison_value {
  id
  name
}
max_prison_years
has_fine
fine
entry_csssa_other_punishment_value {
  id
  name
}
}
  entriesCt {
    all_adults_value {
      name
      id
    }
    motherEntry {
      jurisdiction {
        name
        a2_code
      }
    }
  }
  entriesProtection(type: $type, lang: $entriesProtectionLang2) {
    ge_protection_type {
      name
      id
    }
    ge_explan
    gi_explan
    motherEntry {
      jurisdiction {
        name
        a2_code
      }
    }
    sc_explan
    sc_protection_type {
      name
      id
    }
    so_explan
    so_protection_type {
      id
      name
    }
    so_legal_framework_decrim_mechanism {
      name
      id
    }
    sc_legal_framework_decrim_mechanism {
      name
      id
    }
    gi_protection_type {
      id
      name
    }
    ge_legal_framework_decrim_mechanism {
      name
      id
    }
  }
}
`
const variables = `{
  "lang": "en",
  "type": "A1-5",
  "entriesProtectionLang2": "en"
}
`
const graphql_url = 'https://database.ilga.org/graphql'

function load_ilga_data() {
  return fetch(graphql_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
    .then(response => response.json())
    .then(data => data.data)
}

module.exports = {
  load_ilga_data,
}
