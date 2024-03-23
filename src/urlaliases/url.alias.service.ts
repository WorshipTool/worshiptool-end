import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { UrlAlias, UrlAliasType } from "../database/entities/urlalias.entity";
import { URL_ALIAS_REPOSITORY } from "../database/constants";
import { Repository } from "typeorm";

@Injectable()
export class UrlAliasService {
    constructor(
        @Inject(URL_ALIAS_REPOSITORY)
        private readonly urlAliasRepository: Repository<UrlAlias>
    ) {}

    async getValueFromAlias(
        alias: string,
        type: UrlAliasType
    ): Promise<string> {
        const urlAlias = await this.urlAliasRepository.findOne({
            where: { alias, type }
        });

        if (!urlAlias) {
            return null;
        }

        return urlAlias.value;
    }

    async addAlias(alias: string, value: string, type: UrlAliasType) {
        console.log("New alias", alias);

        // Try to find existing alias
        const existingAlias = await this.urlAliasRepository.findOne({
            where: { alias, type }
        });
        if (existingAlias)
            throw new BadRequestException("Alias is already taken");

        const result = await this.urlAliasRepository.insert({
            alias,
            value,
            type
        });
        return await this.urlAliasRepository.findOne({
            where: { guid: result.identifiers[0].guid }
        });
    }

    async changeAllValues(
        oldValue: string,
        newValue: string,
        type: UrlAliasType
    ) {
        return await this.urlAliasRepository.update(
            { value: oldValue, type },
            { value: newValue }
        );
    }

    async getAliasFromValue(
        value: string,
        type: UrlAliasType
    ): Promise<string> {
        const aliasObject = await this.urlAliasRepository.findOne({
            where: { value, type }
        });

        if (!aliasObject) return null;
        return aliasObject.alias;
    }

    async getAliasObjectFromValue(
        value: string,
        type: UrlAliasType
    ): Promise<UrlAlias> {
        return await this.urlAliasRepository.findOne({
            where: { value, type }
        });
    }
}
