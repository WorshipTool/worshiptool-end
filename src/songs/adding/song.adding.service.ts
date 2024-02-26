import { Injectable } from "@nestjs/common";
import { Sheet } from "@pepavlin/sheet-api";
import { calculateSimilarity } from "../../tech/string.tech";
import { Section } from "@pepavlin/sheet-api/lib/models/song/section";
import { VariantRelationInDto } from "./song.adding.dto";

@Injectable()
export class SongAddingService{
    constructor(
    ){}


}