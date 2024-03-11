import { parallel } from "./parallel.tech";


describe("Parallel Tech Fake", () => {

    it("should be true", async () => {
        const results = await parallel(()=>{

        }, (index)=> {
            return index;
        }, 1)

        expect(results).toBeTruthy();
        expect(results.length).toBe(1);

    });

    it("should be true", async () => {
        const results = await parallel(()=>{
            return "test";
        }, (index, result)=> {

            if(index === 0){
                // Wait for 1 second
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(result);
                    }, 1000);
                });
            }

            return result;
        }, 3)

        expect(results).toBeTruthy();
        expect(results.length).toBe(3);
        expect(results[0]).toBe("test");
        expect(results[1]).toBe("test");
        expect(results[2]).toBe("test");

    });

});

// describe("Parallel Tech True", () => {

//     it("should be true", async () => {
//         const results = await parallel(()=>{

//         }, (index)=> {
//             return index;
//         }, 1, true)

//         expect(results).toBeTruthy();
//         expect(results.length).toBe(1);

//     });

//     it("should be true", async () => {
//         const results = await parallel(()=>{
//             return "test";
//         }, (index, result)=> {

//             if(index === 0){
//                 // Wait for 1 second
//                 return new Promise((resolve, reject) => {
//                     setTimeout(() => {
//                         resolve(result);
//                     }, 1000);
//                 });
//             }

//             return result;
//         }, 3, true)

//         expect(results).toBeTruthy();
//         expect(results.length).toBe(3);
//         expect(results[0]).toBe("test");
//         expect(results[1]).toBe("test");
//         expect(results[2]).toBe("test");

//     });

// });