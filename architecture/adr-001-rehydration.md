# Architecture Decision Record: Rehydration

## Context

We are not able to persist and execute a users intentions across page loads.
This is expressed through a number of issues. The main agitator right now
is maintaining intent whenever a user tries to do anything that requires them to be
authenticated they get redirected off the page and after a successful login they get redirected
back to the origin page but without the intended action fulfilled.

The current example is the AddToChecklist functionality. Whenever a user want's to add a material to
their checklist they click the "Tilføj til huskelist" button besides the material presentation.
https://genbib.dk/ting/object/870970-basis%3A54871910
They then get redirected to https://login.bib.dk/login.
After a successful login they get redirected back to the material page but the material have not been
added to their checklist.

After an intent has been stated we do want the intention to be executed even though a page reload comes in the way.

## Decision

We move to implementing what we define as an explicit intention before the actual action is tried for executing.

This is well illustrated by taking the AddToChecklist example in regard.

__As it is now__

1. User clicks the button.
2. addToChecklist action is fired.
3. Material is added to the users checklist.

__As we need it to be__

1. User clicks the button.
2. Intent state is generated and committed.
3. Implementation checks if the intended action meets all the requirements. In this case, being logged in and having the necessary payload.
4. If the intention meets all requirements we then fire the addToChecklist action.
5. Material is added to the users checklist.

The difference between the two might seem superfluous but the important distinction to make is that with our current implementation we aren't able to serialize and persist the actions across page reloads. By defining intent explicitly we are able to serialize and persist it between page loads.

This resolves in the implementation being able to rehydrate the persisted state, look at it's persisted intentions and have the individual application
implementations decide what to do with the intention.

A mock implementation of the case by case business logic would look as follows.

```jsx

const initialStore = {
  authenticated: false,
  addToChecklistIntent: {
    status: '',
    payload: {}
  }
}

function AddToChecklist ({ materialId, store }) {
  useEffect(() => {
    if (store.addToChecklistIntent.status === 'pending' && store.addToChecklistIntent.payload.materialId === materialId) {
      if (store.authenticated) {
        // We fire the actual functionality required to add a material to the checklist.
        // Besides that we reset the addToChecklistIntent state so that we won't have
        // an infinite loop of addToChecklistAction retries.
        addToChecklistAction(materialId)
      } else {
        // If we do have the desire for an action to be executed as described in our intention
        // but we aren't authenticated we want to try and obtain that authenticated status.
        redirectToLogin()
      }
    }
  }, [materialId, store.addToChecklistIntent.status])
  return (
    <button
      onClick={() => {
        // We do not fire the actual logic that is required to add a material to the checklist.
        // Instead we add the intention of said action to the store.
        // This is when we would set the status of the intent to pending and provide the payload.
        addToChecklistIntention(materialId)
      }}
    >
      Tilføj til huskeliste
    </button>
  )
}
```

## Status

Proposed

## Consequences

- We will be able to support most if not all of our rehydration cases and therefore pick up user flow from where we left it.
- Heavy degree of complexity is added to even the most mundane of tasks that requires an intention instead of a simple action.
