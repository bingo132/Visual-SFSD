import ListFile from '../../structres/ListFile.js';
import Enreg from '../../structres/Enreg.js';
import Block from '../../structres/Block.js';
import {MAX_NB_BLOCKS, MAX_NB_ENREGS_DEFAULT} from "../../../constants.js";

const print = (s) => console.log(s);

export default class LnOF extends ListFile {
    randomBlockIndex() {
        let randomBlockIndex = Math.floor(Math.random() * MAX_NB_BLOCKS);

        if (this.blocks.every((block) => block !== null)) return -1;

        while (this.blocks[randomBlockIndex] !== null) {
            randomBlockIndex = Math.floor(Math.random() * MAX_NB_BLOCKS);
            // console.log(randomBlockIndex)
        }

        return randomBlockIndex;
    }

    search(key, animate=false) {
        let i = this.headIndex;
        let iPrev;
        let j = 0;
        let readTimes = 0;
        let found = false;
        let currBlock;

        if (i === -1) { // when the first element is inserted
            return {
                found: false,
                pos: {
                    i: this.randomBlockIndex(),
                    j: 0
                },
                readTimes: 0
            }
        }

        while (i !== -1 && !found) {
            currBlock = this.blocks[i];
            readTimes++;
            j = 0;

            while (j < currBlock.nb && !found) {
                if (currBlock.enregs[j].key === key) {
                    found = true;
                } else {
                    j++;
                }
            }

            if (!found) {
                iPrev = i;
                i = currBlock.nextBlockIndex;
            }
        }

        if (i === -1) {
            i = iPrev;
        }

        return {
            found: found,
            pos: {
                i: i,
                j: j
            },
            readTimes: readTimes
        }
    }

    insert(key, field1, field2, removed = false, animate) {
        let searchResults = this.search(key, animate);

        let found = searchResults.found,
            i = searchResults.pos.i,
            j = searchResults.pos.j;

        let readTimes = searchResults.readTimes;
        let writeTimes = 0;

        let currBlock;

        if (found) {
            return false;
        } else {
            let newEnreg = new Enreg(key, field1, field2, removed); // create a new enreg.

            if (this.blocks[i] === null) {
                // create new block
                let address = this.setBlockAddress(i);
                this.blocks[i] = new Block([newEnreg], 1, address, -1);
                writeTimes++;
                this.nbBlocks++;

                this.headIndex = i;

                return true;
            }
            currBlock = this.blocks[i];
            readTimes++;

            if (currBlock.nb < MAX_NB_ENREGS_DEFAULT) { // if there is space in the block
                currBlock.nb++;
                currBlock.enregs[j] = newEnreg;
                this.blocks[i] = currBlock;
                writeTimes++;
            } else {
                let newIndex = this.randomBlockIndex();
                currBlock.nextBlockIndex = newIndex;
                this.blocks[i] = currBlock;
                writeTimes++;

                // create new block
                let address = this.setBlockAddress(newIndex);
                this.blocks[newIndex] = new Block([newEnreg], 1, address, -1);
                writeTimes++;
                this.nbBlocks++;
            }

            this.nbInsertions++;

            return true;
        }
    }


    // removeLogically(key) {
    //     let {found, pos, readTimes} =  this.search(key);
    //     let {i, j} = pos;
    //     let writeTimes;
    //
    //     if (found) {
    //         this.blocks[i].enregs[j].removed = true;
    //         writeTimes = 1;
    //         return true;
    //     }
    //     else {
    //         return false;
    //     }
    // }

    // removePhysically(key) {
    //     let {found , pos , readTimes} = this.search(key);
    //     let {i , j} = pos;
    //     let indexOfLastEnreg = this.blocks[this.blocks.length - 1].nb -1;
    //     let lastEnreg = this.blocks[this.blocks.length - 1].enregs[indexOfLastEnreg]
    //     if (found) {
    //         // we replace the enreg to delete physically with the last enreg;
    //         this.blocks[i].enregs[j] = lastEnreg;
    //
    //         // if the last enreg is the only enreg in the block
    //         if (indexOfLastEnreg === 0) {
    //             this.blocks[this.blocks.length - 1].enregs.pop(); // in reality just an extra instruction
    //             this.blocks.pop();
    //             this.nbBlocks--;
    //         } else {
    //             this.blocks[this.blocks.length - 1].enregs.pop();
    //             this.blocks[this.blocks.length - 1].nb--;
    //         }
    //
    //         this.nbInsertions--;
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // editEnreg(key, field1, field2, removed) {
    //     let {found, pos, readTimes} =  this.search(key);
    //     let {i, j} = pos;
    //     let writeTimes;
    //
    //     if (found) {
    //         let block = this.blocks[i];
    //         block.enregs[j].field1 = field1;
    //         block.enregs[j].field2 = field2;
    //         block.enregs[j].removed = removed;
    //         writeTimes = 1;
    //
    //         return true;
    //     } else {
    //         return false;
    //     }
    //
    // }

    // setBlockAddress(index) {
    //
    //     if (index === 0) {
    //         if (this.blocks.length === 0) {
    //             return Math.floor(Math.random() * 10000000000).toString(16);
    //         } else {
    //             return Number((ENREG_SIZE + 1) + parseInt(this.blocks[0].blockAddress, 16)).toString(16)
    //         }
    //     } else {
    //         return Number(index * ENREG_SIZE + parseInt(this.blocks[0].blockAddress, 16)).toString(16)
    //     }
    // }
}