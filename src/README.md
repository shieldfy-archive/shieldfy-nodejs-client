for i in {1..10} ; do curl http://localhost:3000/${i}; done;

# current state of the SDK
- ### Memory monitor `Finished`
    - this monitor finished and it's rule tested `but` maybe need final test
    - The Rules of this monitor exist in the SDK in client module so you can test it

- ### DB monitor `Finished`
    - this monitor finished and it's rule tested `but` maybe need final test
    - The Rules of this monitor exist in the SDK in client module so you can test it

- ### Execution monitor `Not finished`
    - this monitor finished `BUT` the rules of this monitor not recieved from Alaa yet to test it with this monitor
    - The Rules of this monitor `NOT` exist in the SDK you need to put it in client module to test it

- ### View monitor `Not finished`
    - this monitor finished (`in session module because it need to listen for HTTP`) `BUT` the rules of this monitor not recieved from Alaa yet to test it with this monitor
    - The Rules of this monitor `NOT` exist in the SDK you need to put it in client module to test it

- ### Request monitor `Finished`
    - this monitor finished (`in session module because it need to listen for HTTP`) and it's rule tested `but` maybe need final test
    - The Rules of this monitor exist in the SDK in client module so you can test it

- ### File monitor `Finished`
    - this monitor finished and it's rule tested `but` maybe need final test
    - The Rules of this monitor exist in the SDK in client module so you can test it

# we need not to forget
- ### Block the user according to the score if greater than 70 `BECAUSE` the current state is block if the rule matched don't matter to the rule score

- ### shall we normlize the content of the file ?
    - what if the file is to large or the file is a picture maybe this decrease the performance and cost alot of processing
    `BECAUSE` the current state of the SDK the normalize of the content is applied
