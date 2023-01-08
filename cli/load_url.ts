import { Err, Ok, resultFrom, ResultPromise } from "../src/result/api";

function doFetch(url: string): ResultPromise<Response, string> {
  return resultFrom(
    fetch(url)
      .then(
        Ok<Response, string>,
        (err) => Err<Response, string>(err.toString()),
      ),
  );
}

function fetchJson(url: string) {
  return doFetch(url)
    .andThen(async (response) => {
      if (response.ok) {
        return Ok(await response.json());
      } else return Err(`${response.status}: ${await response.text()}`);
    });
}

fetchJson("https:///jsonplaceholder.typicode.com/todos/1")
  .mapOrElse(
    (err) => console.error("Failed", err),
    (todo) => console.log("Success", todo),
  );
