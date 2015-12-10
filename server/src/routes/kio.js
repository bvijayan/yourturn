var winston = require('winston'),
    kio = require('../data/kio'),
    redis = require('../data/redis');

function latestVersions(req, res) {
    var TEAM = req.params.team;

    // first check if we have it in redis
    redis
    .getLatestVersions(TEAM)
    .then(versions => {
        if (versions !== null) {
            winston.debug('Cache hit for latestVersions:' + TEAM);
            // YEAH
            return res
                    .status(200)
                    .type('json')
                    .send(versions);
        }
        winston.debug('Cache miss for latestVersions:' + TEAM);
        // fetch from kio all the stuff
        kio
        .apps()
        // get versions for all apps of this team
        // TODO use team filter in kio when it's available
        .then(apps => Promise.all(
                        apps
                        .filter(a => a.team_id === TEAM)
                        .map(a => kio.versions(a.id))))
        // map to most current version
        .then(all => all
                        .filter(versions => versions.length > 0)
                        .map(versions => versions
                                            .map(v => {
                                                var c = Object.assign({}, v);
                                                c.timestamp = new Date(v.last_modified).getTime();
                                                return c;
                                            })
                                            .reduce((l, v) => Math.max(l.timestamp, v.timestamp) === l.timestamp ?
                                                                l :
                                                                v)))
        // put it in redis
        .then(latestVersions => redis.setLatestVersions(TEAM, latestVersions))
        // return what we got
        .then(latestVersions => res
                                .status(200)
                                .type('json')
                                .send(latestVersions))
        // catch-all
        .catch(err => res.status(500).send(err));
    });
}

module.exports = {
    latestVersions
};