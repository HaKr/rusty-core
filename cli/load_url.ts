import { Err, Ok, ResultPromise } from "../src/lib";

type ToDo = { userId: number; id: number; title: string; completed: boolean };

function doFetch(url: string): ResultPromise<Response, string> {
  return Ok(
    fetch(url)
      .then(
        Ok<Response, string>,
        (err) => Err<Response, string>(err.toString()),
      ),
  );
}

function fetchJson(url: string): ResultPromise<ToDo, string> {
  return doFetch(url)
    .andThen(async (response) => {
      if (response.ok) {
        return Ok<ToDo, string>(await response.json());
      } else {return Err(
          `${response.status} ${response.statusText}: ${await response.text()}`,
        );}
    });
}

fetchJson("https:///jsonplaceholder.typicode.com/todos/1")
  .mapOrElse(
    (err) => console.error("Failed:", err),
    (todo) => console.log("Success:", todo.title),
  );
