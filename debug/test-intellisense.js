var iassign = require('../src/iassign');
// Deep freeze both input and output, can be used in development to make sure they don't change.
iassign.setOption({ freeze: true });
function test1() {
    var map1 = { a: 1, b: 2, c: 3 };
    // 1: Calling iassign() to update map1.b, using overload 2
    var map2 = iassign(map1, function (m) {
        m.b = 50;
        return m;
    });
    console.log(map1);
    console.log(map2);
}
function test2() {
    var list1 = [1, 2];
    // 2.1: Calling iassign() to push items to list1, using overload 2
    var list2 = iassign(list1, function (l) {
        l.push(3, 4, 5);
        return l;
    });
    // list2 = [1, 2, 3, 4, 5]
    // list2 !== list1
    // 2.2: Calling iassign() to unshift item to list2, using overload 2
    var list3 = iassign(list2, function (l) {
        l.unshift(0);
        return l;
    });
    // list3 = [0, 1, 2, 3, 4, 5]
    // list3 !== list2
    // 2.3, Calling iassign() to concat list1, list2 and list3, using overload 2
    var list4 = iassign(list1, function (l) {
        return l.concat(list2, list3);
    });
    // list4 = [1, 2, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5]
    // list4 !== list1
    // 2.4, Calling iassign() to concat sort list4, using overload 2
    var list5 = iassign(list4, function (l) {
        return l.sort();
    });
    // list5 = [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5]
    // list5 !== list4
}
function test3() {
    var nested1 = {
        a: {
            b: {
                c: [3, 4, 5],
                cc: { dd: { ee: { ff: { gg: { hh: { ii: { jj: {} } } } } } } }
            }
        }
    };
    iassign(nested1, function (n) { return n.a.b.c; }, function (c) {
        c.push(10);
        return c;
    });
}
test1();
test2();
test3();
