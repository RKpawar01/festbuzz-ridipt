module.exports = {
    Admin: {
        canCreate: ['FestivalHead', 'EventManager', 'EventCoordinator', 'EventVolunteer'],
        routes: {
            '/api/user': ['GET', 'POST'],
            '/api/fest': ['GET', 'POST', 'PATCH', 'DELETE'],
            '/api/festticket': ['GET', 'POST']

        }
    },
    FestivalHead: {
        canCreate: ['EventManager', 'EventCoordinator', 'EventVolunteer'],
        routes: {
            '/api/fest': ['GET', 'PATCH'],
            '/api/user': ['GET', 'POST'],
        }
    },
    EventManager: {
        canCreate: ['EventCoordinator', 'EventVolunteer'],
        routes: {
            '/api/event': ['GET', 'POST']
        }
    },
    EventCoordinator: {
        canCreate: ['EventVolunteer'],
        routes: {
            '/api/event': ['GET']
        }
    },
    EventVolunteer: {
        canCreate: [],
        routes: {
            '/api/event': ['GET']
        }
    }
};
